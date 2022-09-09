import React from "react";
import { Pagination } from "@shopify/polaris";
import { useRecoilValue } from "recoil";
import { itemRecoil } from "../../recoil/items";
function Panigation(props) {
    const items = useRecoilValue(itemRecoil);

  const handleClickNext = () => {
    props.setSpinner(true);
    setTimeout(() => {
        props.setSpinner(false);
    }, 300);
    props.setCurrent(props.current + 1)
    const data = items.slice(
      5 * (props.current ),
      5 * (props.current + 1)
    );
    props.setPanigation(data);
  };

  const handleClickPrevious = () => {
    props.setSpinner(true);
    props.setCurrent(props.current - 1)
    setTimeout(() => {
      props.setSpinner(false);
    }, 300);
    const data = items.slice(
      5 * (props.current - 2),
      5 * (props.current - 1)
    );
    props.setPanigation(data);
  };
  return (
    <div
      style={{
        height: "100px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pagination
        label={`${props.current} of ${props.sumPage}`}
        hasPrevious={props.current <= 1 ? false : true}
        onPrevious={handleClickPrevious}
        hasNext={props.current >= props.sumPage ? false : true}
        onNext={handleClickNext}
      />
    </div>
  );
}

export default Panigation;
