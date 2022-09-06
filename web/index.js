// @ts-check
import { join } from "path";
// @ts-ignore
// @ts-ignore
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api";
import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr.js";
import productCreator from "./helpers/product-creator.js";
// @ts-ignore
import { BillingInterval } from "./helpers/ensure-billing.js";
import { AppInstallations } from "./app_installations.js";
// @ts-ignore
import { Page, Shop } from '@shopify/shopify-api/dist/rest-resources/2022-07/index.js';
// @ts-ignore
import { publish } from "gh-pages";

const USE_ONLINE_TOKENS = false;
const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";

// @ts-ignore
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;

const DB_PATH = `${process.cwd()}/database.sqlite`;

Shopify.Context.initialize({
  // @ts-ignore
  API_KEY: process.env.SHOPIFY_API_KEY,
  // @ts-ignore
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  // @ts-ignore
  SCOPES: process.env.SCOPES.split(","),
  // @ts-ignore
  HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
  // @ts-ignore
  HOST_SCHEME: process.env.HOST.split("://")[0],
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
});

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop);
  },
});

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const BILLING_SETTINGS = {
  required: false,
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // chargeName: "My Shopify One-Time Charge",
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
};

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
  // @ts-ignore
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
  billingSettings = BILLING_SETTINGS
) {
  const app = express();
  app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE);
  app.set("use-online-tokens", USE_ONLINE_TOKENS);

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app, {
    // @ts-ignore
    billing: billingSettings,
  });

  // Do not call app.use(express.json()) before processing webhooks with
  // Shopify.Webhooks.Registry.process().
  // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
  // for more details.
  app.post("/api/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (e) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });

  // All endpoints after this point will require an active session
  app.use(
    "/api/*",
    verifyRequest(app, {
      // @ts-ignore
      billing: billingSettings,
    })
  );

  app.get("/api/products/count", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.get("/api/products/create", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;

    try {
      await productCreator(session);
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });

  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());

  app.use((req, res, next) => {
    // @ts-ignore
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  // -------------------------------------------------------
  // create page
  app.post("/api/pages", express.json(), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, app.get("use-online-tokens"))
      // @ts-ignore 
      const page = new Page({ session: session })
      page.title = req.body.title
      page.body_html = req.body.body_html
      page.published = req.body.published
      await page.save({
        update: true
      })
      res.status(200).json(page)
    }
    catch (e) {
      res.status(500).json(e)
    }
  })

  // get pages 
  app.get("/api/pages", async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, app.get("use-online-tokens"))
      // @ts-ignore
      const pages = await Page.all({ session: session })
      res.status(200).json(pages)
    }
    catch (e) {
      res.status(500).json(e)
    }
  })

  // get a single page by id
  app.get("/api/pages/:id", express.json(), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, app.get("use-online-tokens"));
      // @ts-ignore
      const page = await Page.find({ session: session, id: req.params.id });
      res.status(200).json(page);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  });

  // get a page acount 
  app.get("api/pages/count", async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, app.get("use-online-tokens"))
      // @ts-ignore
      const page = await Page.count({ session: session })
      res.status(200).json(page)
    }
    catch (e) {
      res.status(500).json(e)
    }
  })

  // update a page
  app.put("/api/pages/:id", express.json(), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, app.get("use-online-tokens"));
      // @ts-ignore
      const page = new Page({ session });
      page.id = req.body.id;
      page.title = req.body.title;
      page.body_html = req.body.body_html;
      page.published = req.body.published;
      await page.save({
        update: true,
      });
      res.json({ success: "success" });
    } catch (error) {
      console.log(error);
    }
  });

  // update published 
  app.put("/api/page/:id", express.json(), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, app.get("use-online-tokens"));
      // @ts-ignore
      const page = new Page({ session });
      page.id = req.body.id;
      page.published = req.body.published;
      await page.save({
        update: true,
      });
      res.json({ success: "success" });
    } catch (error) {
      console.log(error);
    }
  });

  //delete page
  app.delete("/api/pages/:id", async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, app.get("use-online-tokens"))
      // @ts-ignore
      await Page.delete({ session: session, id: req.params.id })
      res.status(200).json("Delete successfully!")
    }
    catch (e) {
      res.status(500).json(e)
    }
  })
  //delete pages
  app.put("/api/pages", express.json(), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, app.get("use-online-tokens"));
      const listIds = req.body.listIds;

      listIds.forEach(async (id) => {
        await Page.delete({
          // @ts-ignore
          session: session,
          id: id,
        });
      });
      res.json({ success: "success" });
    } catch (error) {
      console.log(error);
    }
  });
  // ---------------------------------------------------------

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, { index: false }));
  }

  // @ts-ignore
  app.use("/*", async (req, res, next) => {
    // @ts-ignore
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (!shop) {
      res.status(500);
      return res.send("No shop provided");
    }

    const appInstalled = await AppInstallations.includes(shop);

    if (shop && !appInstalled) {
      res.redirect(`/api/auth?shop=${encodeURIComponent(shop)}`);
    } else {
      const fs = await import("fs");
      const fallbackFile = join(
        isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
        "index.html"
      );
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(fallbackFile));
    }
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
