import React from "react";
import { Page, Layout, Card, Button } from "@shopify/polaris";
import {
  Filters,
  ChoiceList,
  ResourceList,
  ResourceItem,
  TextStyle,
  Loading,
  Frame,
  Spinner,
  Pagination,
  Tabs,
} from "@shopify/polaris";
import { useNavigate } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedVisibiity } from "../recoil/selectedVisibility";
import { itemState } from "../recoil/items";
import { useAuthenticatedFetch } from "../hooks";
import "./style.css";

function HomePage() {
  const fetchApi = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [selected, setSelected] = useState(0)
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortValue, setSortValue] = useState("DATE_MODIFIED_DESC");
  const [visibility, setVisibility] = useState("");
  const [queryValue, setQueryValue] = useState(null);
  const [items, setItems] = useRecoilState(itemState);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [sumPage, setSumPage] = useState(0);
  const [panigation, setPanigation] = useState([]);
  let currentPage = useRef(1);

  const handleVisibilityChange = useCallback(
    (value) => setVisibility(value),
    []
  );
  const handleQueryValueChange = useCallback(
    (value) => setQueryValue(value),
    []
  );
  const handleVisibilityRemove = useCallback(() => setVisibility(null), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);
  const handleClearAll = useCallback(() => {
    handleVisibilityRemove();
    handleQueryValueRemove();
  }, [handleQueryValueRemove, handleVisibilityRemove]);

  // const handleClickDeletePage = async () => {
  //   try {
  //     const res = await fetchApi('/api/pages')
  //   }
  // }

  const resourceName = {
    singular: "page",
    plural: "pages",
  };

  const handleClickDeletePages = async () => {
    // setLoading(true);
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ listIds: selectedItems }),
    };
    fetchApi("/api/pages", options)
      .then((res) => res.json())
      .then(() => {
        // setLoading(false);
        setIsDeleted(!isDeleted);
      })
      .catch((err) => console.log(err));
  };

  const handleClickHiddenPages = async () => {
    selectedItems.forEach((id) => {
      fetchApi(`api/page/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id: +id, published: false }),
      })
        // .then((res) => res.json())
        .then(() => {
          console.log("ok");
          setIsDeleted(!isDeleted);
        })
        .catch((err) => console.log(err));
    });
  };

  const handleClickShowPages = async () => {
    selectedItems.forEach((id) => {
      fetchApi(`api/page/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id: +id, published: true }),
      })
        // .then((res) => res.json())
        .then(() => {
          console.log("ok");
          setIsDeleted(!isDeleted);
        })
        .catch((err) => console.log(err));
    });
  };

  const bulkActions = [
    {
      content: "Show selected pages",
      onAction: handleClickShowPages,
    },
    {
      content: "Hide selected pages",
      onAction: handleClickHiddenPages,
    },
    {
      content: "Delete the page",
      onAction: handleClickDeletePages,
    },
  ];

  const handleTabChange = useCallback(e => setSelected(e))

  const filters = [
    {
      key: "visibility3",
      label: "Sort by",
      filter: (
        <ChoiceList
          title="Visibility"
          // value={visibility}
          onChange={handleVisibilityChange}
          titleHidden
          choices={[
            { label: "Newest update", value: "DATE_MODIFIED_DESC" },
            { label: "Oldest update", value: "DATE_MODIFIED_ASC" },
          ]}
          selected={visibility || []}
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = !isEmpty(visibility)
    ? [
        {
          key: "visibility3",
          label: disambiguateLabel("visibility3", visibility),
          onRemove: handleVisibilityRemove,
        },
      ]
    : [];

  const filterControl = (
    <Filters
      queryValue={queryValue}
      filters={filters}
      // appliedFilters={appliedFilters}
      // onQueryChange={handleQueryValueChange}
      // onQueryClear={handleQueryValueRemove}
      // onClearAll={handleClearAll}
    >
      {/* <div style={{ paddingLeft: "8px" }}>
        <Button onClick={() => console.log("New filter saved")}>Save</Button>
      </div> */}
    </Filters>
  );

  useEffect(() => {
    setLoading(true);
    setSpinner(true);
    const getPages = async () => {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      };
      try {
        const res = await fetchApi("/api/pages", options);
        const data = await res.json();
        console.log(data);
        setItems(data);
        const data1 = items.slice(
          5 * (currentPage.current - 1),
          5 * currentPage.current
        );
        setPanigation(data1);
        setLoading(false);
        setSpinner(false);
        setSumPage(Math.ceil(items.length / 5));
        return data;
      } catch (e) {
        console.log(e);
      }
    };
    getPages();
    setSelectedItems([]);
  }, [isDeleted]);

  const tabs = [
    {
      id: "all",
      content: "All",
      accessibilityLabel: "All",
      panelID: "all-content",
    },
  ];
  // console.log(selectedItems);
  return (
    <Frame>
      {loading && <Loading />}
      <Page
        fullWidth
        title="Page"
        primaryAction={
          <Button onClick={() => navigate("/pagename")} primary>
            Add Pages
          </Button>
        }
      >
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs tabs={tabs} selected={selected}></Tabs>
              {!spinner && (
                <ResourceList
                  resourceName={resourceName}
                  items={panigation}
                  renderItem={renderItem}
                  selectedItems={selectedItems}
                  onSelectionChange={setSelectedItems}
                  // promotedBulkActions={promotedBulkActions}
                  bulkActions={bulkActions}
                  sortValue={sortValue}
                  // sortOptions={[
                  //   {label: 'Newest update', value: 'DATE_MODIFIED_DESC'},
                  //   {label: 'Oldest update', value: 'DATE_MODIFIED_ASC'},
                  // ]}
                  onSortChange={(selected) => {
                    setSortValue(selected);
                    console.log(`Sort option changed to ${selected}.`);
                  }}
                  filterControl={filterControl}
                />
              )}
            </Card>
            <Card>
              {spinner && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                  }}
                >
                  <Spinner accessibilityLabel="Spinner example" size="large" />
                </div>
              )}
            </Card>
          </Layout.Section>
          {sumPage && !loading ? (
            <Layout.Section>
              <div
                style={{
                  height: "100px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pagination
                  label={`${currentPage.current} of ${sumPage}`}
                  hasPrevious={currentPage.current == 1 ? false : true}
                  onPrevious={() => {
                    setSpinner(true);
                    if (currentPage.current <= 1) {
                      currentPage.current = 1;
                    } else {
                      currentPage.current -= 1;
                    }
                    setTimeout(() => {
                      setSpinner(false);
                    }, 800);
                    const data = items.slice(
                      5 * (currentPage.current - 1),
                      5 * currentPage.current
                    );
                    console.log(data);
                    setPanigation(data);
                  }}
                  hasNext={currentPage.current == sumPage ? false : true}
                  onNext={() => {
                    setSpinner(true);
                    if (currentPage.current >= sumPage) {
                      currentPage.current = sumPage;
                    } else {
                      currentPage.current += 1;
                    }
                    setTimeout(() => {
                      setSpinner(false);
                    }, 800);
                    const data = items.slice(
                      5 * (currentPage.current - 1),
                      5 * currentPage.current
                    );
                    setPanigation(data);
                  }}
                />
              </div>
            </Layout.Section>
          ) : null}
        </Layout>
      </Page>
    </Frame>
  );
  function renderItem(item) {
    const { id, title, body_html, updated_at, published_at } = item;
    const body = body_html.substring(3, body_html.length - 4);
    const time = `${updated_at.substring(11, 16)} ${updated_at.substring(
      0,
      10
    )}`;

    return (
      <ResourceItem
        id={id}
        // url={url}
        // accessibilityLabel={`View details for ${title}`}
        // persistActions
        onClick={() => navigate(`/${id}`)}
      >
        <h3 style={{ display: "flex" }}>
          <TextStyle variation="strong">{title}</TextStyle>
          {!published_at && <div className="hidden">hidden</div>}
        </h3>
        <h3>
          <TextStyle variation="subdued">{body}</TextStyle>
        </h3>
        <h3>
          <TextStyle variation="subdued">{time}</TextStyle>
        </h3>
      </ResourceItem>
    );
  }

  function disambiguateLabel(key, value) {
    switch (key) {
      case "visibility3":
        return `Visibility ${value}`;
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }
}

export default HomePage;
