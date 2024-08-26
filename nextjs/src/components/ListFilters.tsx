"use client";

import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import styles from "./ListFilters.module.scss";
import { ChevronDown } from "react-feather";

export function ListFilters() {
  return (
    <>
      <div className={styles["filters"]}>
        <Dropdown as={ButtonGroup}>
          <Dropdown.Toggle
            id="dropdown-custom-1"
            className={styles["dropdown"]}
          >
            <div>
              Sort by <span className={styles["active-sort"]}>Rating</span>
            </div>
            <ChevronDown size={16} />
          </Dropdown.Toggle>
          <Dropdown.Menu className="" data-bs-theme="dark">
            <Dropdown.Item eventKey="1" active>
              Rating
            </Dropdown.Item>
            <Dropdown.Item eventKey="2">Hours</Dropdown.Item>
            <Dropdown.Item eventKey="3">Release date</Dropdown.Item>
            {/* <Dropdown.Divider />
          <Dropdown.Item eventKey="4">Separated link</Dropdown.Item> */}
          </Dropdown.Menu>
        </Dropdown>
        <div className={"roww"} style={{ gap: "4px" }}>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle
              id="dropdown-custom-2"
              className={styles["dropdown"]}
            >
              <div>
                Filter by tags
                {/* <span className={styles["active-sort"]}>Rating</span> */}
              </div>
              <ChevronDown size={16} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="" data-bs-theme="dark">
              <Dropdown.Item eventKey="1" active>
                This doesn&apos;t work yet
              </Dropdown.Item>
              <Dropdown.Item eventKey="2">Change to be</Dropdown.Item>
              <Dropdown.Item eventKey="3">Multi-select</Dropdown.Item>
              {/* <Dropdown.Divider />
          <Dropdown.Item eventKey="4">Separated link</Dropdown.Item> */}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle
              id="dropdown-custom-3"
              className={styles["dropdown"]}
              style={{ width: "100px" }}
            >
              <span className={styles["active-sort"]}>Or</span>
              <ChevronDown size={16} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="" data-bs-theme="dark">
              <Dropdown.Item eventKey="1" active>
                Or
              </Dropdown.Item>
              <Dropdown.Item eventKey="2">And</Dropdown.Item>
              {/* <Dropdown.Divider />
          <Dropdown.Item eventKey="4">Separated link</Dropdown.Item> */}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </>
  );
}
