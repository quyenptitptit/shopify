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
  Pagination,
  Tabs,
} from "@shopify/polaris";
import { useNavigate } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  itemRecoil,
  pagesRecoil,
  selectedItemsRecoil,
  panigationRecoil,
} from "../recoil/items";
import { useAuthenticatedFetch } from "../hooks";
import "./style.css";
import Panigation from "../components/HomaPage/Panigation";

function HomePage() {
  const fetchApi = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItems, setSelectedItems] = useRecoilState(selectedItemsRecoil);
  const [selectSort, setSelectSort] = useState("");
  const [selectVisibility, setSelectVisibility] = useState("");
  const [queryValue, setQueryValue] = useState("");

  const [items, setItems] = useRecoilState(itemRecoil);
  const [pages, setPages] = useRecoilState(pagesRecoil);
  const [panigation, setPanigation] = useRecoilState(panigationRecoil);
  const [sumPage, setSumPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spinner, setSpinner] = useState(false);

  // ----------------action----------------
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
        setReload(!reload);
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
          setReload(!reload);
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
          setReload(!reload);
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

  // ------------------tabs-------------------
  const tabs = [
    {
      id: "all",
      content: "All",
      accessibilityLabel: "All",
      panelID: "all-content",
    },
  ];

  const handleTabChange = useCallback((e) => setSelectedTab(e));

  // -----------------filter----------------
  const handleQueryValueChange = (value) => {
    setQueryValue(value);
    const newFilter = pages.filter((val) =>
      val.title.toLowerCase().includes(value.toLowerCase())
    );
    setItems(newFilter);
    setSumPage(Math.ceil(newFilter.length / 5));
    setPanigation(newFilter.slice(0, 5));
  };

  const handleQueryValueRemove = useCallback(() => {
    setQueryValue("");
    setPanigation(pages.slice(0, 5));
    setItems(pages);
    setSumPage(Math.ceil(pages.length / 5));
    setCurrentPage(1);
  }, []);

  // ------------------sort-----------------
  const handleSelectSortChange = useCallback((value) => {
    setSelectSort(value);
    handleVisibilityRemove();
    handleClickSort(value[0]);
  }, []);

  const sortASC = (a, b) => {
    const varA = new Date(a.updated_at);
    const varB = new Date(b.updated_at);
    return varA - varB;
  };

  const sortDESC = (a, b) => {
    const varA = new Date(a.updated_at);
    const varB = new Date(b.updated_at);
    return varB - varA;
  };

  const handleClickSort = (value) => {
    let sorted;
    setSpinner(true);
    // console.log(items);
    switch (value) {
      case "DATE_MODIFIED_DESC":
        sorted = [...pages].sort(sortDESC);
        setItems(sorted);
        setPanigation(sorted.slice(0, 5));
        setCurrentPage(1);
        setSumPage(Math.ceil(sorted.length / 5));
        setTimeout(() => {
          setSpinner(false);
        }, 300);
        break;
      case "DATE_MODIFIED_ASC":
        sorted = [...pages].sort(sortASC);
        setItems(sorted);
        setPanigation(sorted.slice(0, 5));
        setCurrentPage(1);
        setSumPage(Math.ceil(sorted.length / 5));
        setTimeout(() => {
          setSpinner(false);
        }, 300);
        break;
      default:
        break;
    }
  };

  const handleSortRemove = useCallback(() => {
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
    }, 300);
    setSelectSort(null);
    setItems(pages);
    setPanigation(pages.slice(0, 5));
    setSumPage(Math.ceil(pages.length / 5));
    setCurrentPage(1);
    // setIsVisibility(false)
  });

  // -----------------visibility------------------
  const handleSelectVisibilityChange = useCallback((value) => {
    setSelectVisibility(value);
    handleSortRemove();
    handleClickVisibility(value[0]);
  }, []);

  const handleClickVisibility = (value) => {
    let filter;
    setSpinner(true);
    switch (value) {
      case "VISIBILITY_DISPLAY":
        filter = [...pages].filter((page) => page.published_at);
        setItems(filter);
        setPanigation(filter.slice(0, 5));
        setCurrentPage(1);
        setSumPage(Math.ceil(filter.length / 5));
        setTimeout(() => {
          setSpinner(false);
        }, 300);
        break;
      case "VISIBILITY_HIDDEN":
        filter = [...pages].filter((page) => !page.published_at);
        setItems(filter);
        setPanigation(filter.slice(0, 5));
        setCurrentPage(1);
        setSumPage(Math.ceil(filter.length / 5));
        setTimeout(() => {
          setSpinner(false);
        }, 300);
        break;
    }
  };

  const handleVisibilityRemove = useCallback(() => {
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
    }, 300);
    setSelectVisibility(null);
    setItems(pages);
    setPanigation(pages.slice(0, 5));
    setSumPage(Math.ceil(pages.length / 5));
    setCurrentPage(1);
  }, []);

  // -------------filterControl----------------
  const filters = [
    {
      key: "sort3",
      label: "Sort by",
      filter: (
        <ChoiceList
          title=""
          value={selectSort}
          onChange={handleSelectSortChange}
          titleHidden
          choices={[
            { label: "Newest update", value: "DATE_MODIFIED_DESC" },
            { label: "Oldest update", value: "DATE_MODIFIED_ASC" },
          ]}
          selected={selectSort || []}
        />
      ),
      shortcut: true,
    },
    {
      key: "visibility3",
      label: "Visibility",
      filter: (
        <ChoiceList
          title=""
          titleHidden
          value={selectVisibility}
          selected={selectVisibility || []}
          onChange={handleSelectVisibilityChange}
          choices={[
            { label: "Display", value: "VISIBILITY_DISPLAY" },
            { label: "Hidden", value: "VISIBILITY_HIDDEN" },
          ]}
        />
      ),
      shortcut: true,
    },
  ];

  function disambiguateLabel(key, value) {
    switch (key) {
      case "visibility3":
        return `${value}`;
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

  const appliedFilters = !isEmpty(selectVisibility)
    ? [
        {
          key: "visibility3",
          label: disambiguateLabel("visibility3", selectVisibility),
          onRemove: handleVisibilityRemove,
        },
      ]
    : !isEmpty(selectSort)
    ? [
        {
          key: "sort3",
          label: disambiguateLabel("sort3", selectSort),
          onRemove: handleSortRemove,
        },
      ]
    : [];

  const filterControl = (
    <Filters
      filters={filters}
      appliedFilters={appliedFilters}
      queryValue={queryValue}
      onQueryChange={handleQueryValueChange}
      onQueryClear={handleQueryValueRemove}
    ></Filters>
  );

  // ---------------renderItem----------------------
  const resourceName = {
    singular: "pages",
    plural: "pages",
  };

  function renderItem(item) {
    const { id, title, body_html, updated_at, published_at } = item;
    const body = body_html.substring(3, body_html.length - 4);
    const time = `${updated_at.substring(11, 16)} ${updated_at.substring(
      0,
      10
    )}`;

    return (
      <ResourceItem id={id} onClick={() => navigate(`/${id}`)}>
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
      fetchApi("api/pages", options)
        .then((res) => res.json())
        .then((data) => {
          setPages(data);
          setItems(data);
          const data1 = data.slice(5 * (currentPage - 1), 5 * currentPage);
          setPanigation(data1);
          setLoading(false);
          setSpinner(false);
          setSumPage(Math.ceil(pages.length / 5));
        })
        .catch((e) => console.log(e));
    };
    getPages();
    setSelectedItems([]);
  }, [reload]);

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
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={handleTabChange}
              ></Tabs>
              <ResourceList
                resourceName={resourceName}
                items={panigation}
                renderItem={renderItem}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                bulkActions={bulkActions}
                filterControl={filterControl}
                loading={spinner ? true : false}
              />
            </Card>
          </Layout.Section>
          {sumPage && !loading ? (
            <Layout.Section>
              <Panigation
                current={currentPage}
                setCurrent={setCurrentPage}
                sumPage={sumPage}
                setSpinner={setSpinner}
                setPanigation={setPanigation}
              />
            </Layout.Section>
          ) : null}
        </Layout>
      </Page>
    </Frame>
  );
}

export default HomePage;
