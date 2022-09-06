import { React, useEffect, useState } from "react";
import PageName from "./pagename";
import { useParams } from "react-router-dom";

function UpdatePage() {
  const { id } = useParams();
  return (
    <PageName id={id} />
  )
}

export default UpdatePage;
