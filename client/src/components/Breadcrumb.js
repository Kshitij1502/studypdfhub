import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/breadcrumb.css";

const formatLabel = (segment) => {
  if (segment === "course") return null;
  if (segment === "semester") return null;
  if (segment === "bca") return "BCA";
  if (segment === "mca") return "MCA";
  if (!isNaN(segment)) return `Semester ${segment}`;

  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

const Breadcrumb = () => {
  const location = useLocation();

  // Hide on home
  if (location.pathname === "/") return null;

  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <div className="breadcrumb breadcrumb-animate">
      <Link to="/">Home</Link>

      {paths.map((path, index) => {
        const label = formatLabel(path);
        if (!label) return null;

        const route = "/" + paths.slice(0, index + 1).join("/");

        return (
          <span key={index}>
            {" / "}
            <Link to={route}>{label}</Link>
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
