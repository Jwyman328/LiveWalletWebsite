import React from "react";
import { Table } from "@mantine/core";

export const Download = () => {
  const latestVersions = [
    {
      type: "MacOS (Apple M1/M2/M3)",
      label: "1.0.0-arm64.dmg",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/1.0.0/Live.Wallet-1.0.0-arm64.dmg",
    },
    {
      type: "MacOS (Intel)",
      label: "1.0.0.dmg",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/1.0.0/Live.Wallet-1.0.0.dmg",
    },
  ];
  const previousVersions = [
    {
      type: "MacOS (Apple M1/M2/M3)",
      label: "0.9.0-arm64.dmg",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.9.0/Live.Wallet-0.9.0-arm64.dmg",
    },
    {
      type: "MacOS (Intel)",
      label: "0.9.0.dmg",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.9.0/Live.Wallet-0.9.0.dmg",
    },
    {
      type: "Linux (Intel/AMD) (Ubuntu/Debian)",
      label: "0.9.0_amd64.deb",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.9.0/LiveWallet_0.9.0_amd64.deb",
    },
    {
      type: "Linux (ARM64) (Ubuntu/Debian)",
      label: "0.9.0_arm64.deb",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.9.0/LiveWallet_0.9.0_arm64.deb",
    },
    {
      type: "Linux (Intel/AMD) (Redhat/CentOs)",
      label: "0.9.0.x86_64.rpm",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.9.0/LiveWallet-0.9.0.x86_64.rpm",
    },
    {
      type: "Linux (ARM64) (Redhat/CentOs)",
      label: "0.9.0.aarch64.rpm",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.9.0/LiveWallet-0.9.0.aarch64.rpm",
    },
    {
      type: "Windows Installer (10+)",
      label: "Live.Wallet.Setup.0.9.0.exe",
      link: "https://github.com/Jwyman328/LiveWallet/releases/download/0.9.0/Live.Wallet.Setup.0.9.0.exe",
    },
  ];
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

        <p className="mt-4 font-semibold">Latest release: 1.0.0 </p>
        <DownloadsTable versions={latestVersions} />
        <p className="mt-4 font-semibold">Previous release: 0.9.0 </p>
        <DownloadsTable versions={previousVersions} />
      </div>
    </div>
  );
};

const DownloadsTable = ({ versions }: { versions: any }) => {
  const rows = versions.map((element: any) => (
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
