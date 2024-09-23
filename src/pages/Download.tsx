import React from "react";
import { Table } from "@mantine/core";

export const Download = () => {
  return (
    <div className="pt-10 flex flex-col items-center w-full bg-gray-100 w-full">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold" style={{ color: "#228BE6" }}>
          Downloads
        </h1>
        <div className="text-blue-600 underline font-medium">
          <a
            rel="noreferrer"
            target="_blank"
            href="https://github.com/Jwyman328/LiveWallet/releases"
          >
            All releases and changelog
          </a>
        </div>
        <p className="mt-4 font-semibold">Latest release: 0.8.0 </p>
        <DownloadsTable />
      </div>
    </div>
  );
};

const DownloadsTable = () => {
  const versions = [
    {
      type: "MacOS (Apple M1/M2/M3)",
      label: "0.8.0-arm64.dmg",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.8.0/Live.Wallet-0.8.0-arm64.dmg",
    },
    {
      type: "MacOS (Intel)",
      label: "0.8.0.dmg",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.8.0/Live.Wallet-0.8.0.dmg",
    },
    {
      type: "Linux (Intel/AMD) (Ubuntu/Debian)",
      label: "0.8.0_amd64.deb",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.8.0/LiveWallet_0.8.0_amd64.deb",
    },
    {
      type: "Linux (ARM64) (Ubuntu/Debian)",
      label: "0.8.0_arm64.deb",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.8.0/LiveWallet_0.8.0_arm64.deb",
    },
  ];
  const rows = versions.map((element) => (
    <Table.Tr key={element.type}>
      <Table.Td>
        <div className="w-52">
          <p className="mt-1 font-semibold">{element.type}</p>
        </div>
      </Table.Td>
      <Table.Td>
        <a className="text-blue-600 underline font-medium" href={element.link}>
          {element.label}
        </a>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Type</Table.Th>
            <Table.Th>Download Link</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
