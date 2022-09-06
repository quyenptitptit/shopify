import {
  Card,
  Page,
  Layout,
  TextContainer,
  ChoiceList,
  PageActions,
  FormLayout,
  TextField,
  Button,
  Select,
  Stack,
  ButtonGroup,
  Frame,
  Loading,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import EditorPage from "./EditorPage";
import { useNavigate } from "@shopify/app-bridge-react";
import { useAuthenticatedFetch } from "../hooks";
import { useRecoilState } from "recoil";
import { selectedVisibiity } from "../recoil/selectedVisibility";
import { itemState } from "../recoil/items";
import { useLocation } from "react-router-dom";
// import { createPage } from '../services/Service'

export default function PageName(props) {
  const [selected, setSelected] = useState(["display"]);
  const [isSelect, setIsSelect] = useRecoilState(selectedVisibiity);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [items, setItems] = useRecoilState(itemState);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const fetchApi = useAuthenticatedFetch();

  const handleChange = useCallback((value) => {
    setSelected(value);
    setIsSelect(!isSelect);
  }, []);

  const handleChangeTitle = useCallback((value) => setTitle(value), []);

  const handleClickSave = () => {
    // const newPage = {
    //   title: title,
    //   body_html: body,
    //   published: false
    // };
    let newPage = {
      title: title,
      body_html: body,
      published: selected[0] === "hidden" ? false : true,
    };

    if (props.id) {
      const handleUpdatePage = () => {
        setLoading(true);
        const options = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            id: +props.id,
            title: title,
            body_html: body,
            published: selected[0]==='hidden' ? false : true
          }),
        };
        fetchApi(`/api/pages/${props.id}`, options)
          .then((res) => {
            // console.log(res);
            setLoading(false)
            navigate('/')
            // res.json();
          })
          // .then((data) => {
          //     if (data.hasOwnProperty("success")) {
          //         // setShowToast(true);
          //         // setErrorMessage("");
          //     } else {
          //         setErrorMessage(Object.entries(data.response.body.errors));
          //         // setShowToast(true);
          //     }
          //     setLoading(false);
          // })
          .catch((error) => {
            // setErrorMessage("Error");
            // setShowToast(true);
            console.log(error);
          });
        };
        handleUpdatePage();
    } else {
      const createPage = async () => {
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(newPage),
        };
        try {
          console.log(newPage);
          const res = await fetchApi("/api/pages", options);
          const data = await res.json();
          // console.log(data);
          setItems([...items, data]);
          setTitle("");
          setBody("");
          navigate("/");
          return data;
        } catch (e) {
          console.log(e);
        }
      };
      createPage();
    }
  };

  const handleClickDeletePage = async () => {
    if (props.id) {
      const options = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      };
      try {
        const res = await fetchApi(`api/pages/${props.id}`, options);
        navigate("/");
      } catch (e) {
        console.log(e);
      }
    } else {
      navigate("/");
    }
  };

  const today = new Date();

  useEffect(() => {
    setLoading(true);
    if (props.id) {
      const getPage = async () => {
        const options = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        };
        try {
          const res = await fetchApi(`api/pages/${props.id}`, options);
          const data = await res.json();
          console.log(data);
          setTitle(data.title);
          setBody(data.body_html);
          setLoading(false);
          data.published_at ? setSelected(['display']) : setSelected(['hidden'])
          return data;
        } catch (e) {
          console.log(e);
        }
      };
      getPage();
    }
    else {
      setTimeout(() => {
        setLoading(false)
      }, 300);
    }
  }, []);

  return (
    <Frame>
      {loading && <Loading />}
      <Page
        breadcrumbs={[{ content: "Back", url: "/" }]}
        title={title ? title : `Add page`}
      >
        <TitleBar />
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <FormLayout>
                <TextField
                  label="Title"
                  onChange={handleChangeTitle}
                  autoComplete="off"
                  placeholder="Example: Contact Us, Size Chart, FAQ"
                  value={title}
                />
                <EditorPage body={body} setBody={setBody} />
              </FormLayout>
            </Card>
            <Card
              sectioned
              title="Preview profiles for search engines"
              actions={[{ content: "Website CEO Editting" }]}
            >
              <TextContainer>
                {title && body ? (
                  <div>
                    <h1 style={{ fontSize: "1.125rem", color: "#1a0dab" }}>
                      {title}
                    </h1>
                    <h2
                      style={{ fontSize: "0.8125rem", color: "#006621" }}
                    >{`https://quyenquyenquyen.myshopify.com/pages/${title}`}</h2>
                    <h2 style={{ fontSize: "0.8125rem" }}>
                      {body.substring(3, body.length - 4)}
                    </h2>
                  </div>
                ) : (
                  <p>
                    Add a title and description to see how this Page will appear
                    in your search engine listing
                  </p>
                )}
              </TextContainer>
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card sectioned title="Visibility">
              <Stack>
                <Stack.Item>
                  <ChoiceList
                    choices={[
                      {
                        label: `Display (as of ${today.getHours()}:${today.getMinutes()}, ${today.getDate()}/${today.getMonth()}/${today.getFullYear()})`,
                        value: "display",
                      },
                      { label: "Hidden", value: "hidden" },
                    ]}
                    selected={selected}
                    onChange={handleChange}
                  />
                </Stack.Item>
                <Stack.Item>
                  <Button plain>Set display date</Button>
                </Stack.Item>
              </Stack>
            </Card>
            <Card sectioned title="Shop Online">
              <TextContainer>
                <Select
                  label="Theme template"
                  options={[
                    { label: "Default page", value: "default" },
                    { label: "Contact", value: "contact" },
                  ]}
                  value={selected}
                />
                <p>
                  Specify a template in your current theme to define how the
                  page should be displayed.
                </p>
              </TextContainer>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <PageActions
              primaryAction={{
                content: "Save",
                disabled: !title && !body,
                onAction: handleClickSave,
              }}
              secondaryActions={[
                {
                  content: props.id ? "Delete page" : "Cancel",
                  onAction: handleClickDeletePage,
                },
              ]}
            />
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
