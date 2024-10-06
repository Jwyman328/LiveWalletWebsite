import React, { useEffect, useState } from "react";
import { Group, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./HeaderSimple.module.css";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const links = [
    { link: "/", label: "Home" },
    { link: "/download", label: "Download" },
    { link: "/sandbox", label: "Sandbox" },
  ];

  const location = useLocation();

  const [opened, { toggle }] = useDisclosure(true);
  const [active, setActive] = useState(location?.pathname);

  useEffect(() => {
    setActive(location.pathname);
  }, [location.pathname]);

  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link}
      relative="path"
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={() => {
        setActive(link.link);
      }}
    >
      {link.label}
    </Link>
  ));
  return (
    <div>
      <div className="max-[1200px]:px-6 max-[1400px]:px-10 px-28 pt-8 w-screen bg-gray-100">
        <header className={classes.header}>
          <div className={"h-14 flex flex-row justify-between align-center "}>
            <Title />
            <Group gap={10} visibleFrom="xs">
              {items}
            </Group>

            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="xs"
              size="sm"
            />
          </div>
        </header>
      </div>
    </div>
  );
};

const Title = () => {
  return (
    <div className="flex flex-row items-center">
      <img alt="logo" className="w-16 h-16 mr-4" src="iconNoBg.png" />
      <div className="flex flex-col pt-1">
        <h1 className="font-semibold text-3xl" style={{ color: "#228BE6" }}>
          Live Wallet
        </h1>
        <p className="italic">Keep your utxos alive</p>
      </div>
    </div>
  );
};
