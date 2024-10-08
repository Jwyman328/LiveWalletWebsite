import React, { useEffect, useMemo, useState } from "react";

import { createTheme, ThemeProvider } from "@mui/material";
import Big from "big.js";
import {
  MaterialReactTable,
  MRT_RowSelectionState,
  useMaterialReactTable,
} from "material-react-table";

import { useDisclosure } from "@mantine/hooks";
import { usePrevious } from "../hooks/utils";
import { Utxo, UtxoRequestParamWithAmount } from "../api/types";
import { createTxFeeEstimate } from "../bitcoin/txFeeCalculation";
import { ScriptTypes } from "../types/scriptTypes";
import { BtcMetric, btcSatHandler } from "../types/btcSatHandler";
import { Collapse, ActionIcon } from "@mantine/core";
import { IconCircleCheck, IconCircleX, IconTrash } from "@tabler/icons-react";

const sectionColor = "rgb(1, 67, 97)";

type UtxoTableProps = {
  utxos: Utxo[];
  areRowsSelectable: boolean;
  onRowSelection: (rowData: UtxoRequestParamWithAmount[]) => void;
  walletType: ScriptTypes;
  signaturesNeeded: number;
  btcPrice: number;
  numberOfXpubs: number;
  receivingOutputCount: number;
  feeRate: number;
  getFeeRateColor: any;
  btcMetric: BtcMetric;
  title?: string;
  isShowTxId?: boolean;
  // TODO fix type
  setUtxos: any;
  areRowsDeletable: boolean;
};

export const UtxoTable = ({
  title = "Inputs",
  utxos,
  areRowsSelectable,
  walletType,
  signaturesNeeded,
  numberOfXpubs,
  receivingOutputCount,
  feeRate,
  getFeeRateColor,
  btcPrice,
  btcMetric,
  isShowTxId = true,
  onRowSelection,
  setUtxos,
  areRowsDeletable,
}: UtxoTableProps) => {
  // each row represents one utxo
  const TX_INPUTS_PER_ROW = 1;
  const totalVBtyes = createTxFeeEstimate(
    TX_INPUTS_PER_ROW,
    walletType,
    signaturesNeeded,
    numberOfXpubs,
    receivingOutputCount
  );
  const totalCost = totalVBtyes * feeRate;
  const calculateFeePercent = (amount: number) => {
    const percentOfAmount = (totalCost / amount) * 100;
    const formatted =
      percentOfAmount > 1
        ? percentOfAmount.toFixed(2)
        : percentOfAmount.toFixed(4);

    return formatted;
  };
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const getSelectedUtxos = React.useCallback(
    (selectedTxRows: MRT_RowSelectionState) => {
      const selectedUtxosFromatted: UtxoRequestParamWithAmount[] = [];
      utxos.forEach((utxo) => {
        if (selectedTxRows[utxo.txid]) {
          selectedUtxosFromatted.push({
            id: utxo.txid,
            vout: utxo.vout,
            amount: utxo.amount,
          });
        }
      });
      return selectedUtxosFromatted;
    },
    [utxos]
  );

  const [opened, { toggle }] = useDisclosure(false);
  const previousShowing = usePrevious(opened);

  const deleteUtxo = (
    selectedTxId: string,
    selectedRows: MRT_RowSelectionState
  ) => {
    // get the existing utxos and just remove the one that has this id
    const nextUtxos = utxos.filter((utxo) => utxo.txid !== selectedTxId);
    setUtxos(nextUtxos);

    // remove from selected if the deleted utxo was a selected utxo
    if (selectedRows.hasOwnProperty(selectedTxId)) {
      delete selectedRows[selectedTxId];
    }

    setRowSelection({ ...selectedRows });
  };

  const DisplaySelectedUtxosData = () => {
    const totalUtxosSelected = Object.keys(rowSelection).length;
    const utxosWithData = getSelectedUtxos(rowSelection);
    const totalAmount: number = utxosWithData.reduce(
      (total, utxo) => total + utxo.amount,
      0
    );

    const totalAmountInBTC = btcSatHandler(
      totalAmount.toLocaleString(),
      BtcMetric.BTC
    );
    const totalAmountUsd = Big(btcPrice).times(totalAmountInBTC).toFixed(2);

    const amountUSDDisplay = totalAmountUsd
      ? `$${Number(totalAmountUsd).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`
      : "...";

    return (
      <>
        <div>
          <p
            style={{
              color: sectionColor,
            }}
            className=" font-semibold text-lg"
          >
            Count: {totalUtxosSelected}{" "}
          </p>
          <p
            style={{
              color: sectionColor,
            }}
            className="font-semibold text-lg"
          >
            {btcMetric === BtcMetric.BTC ? " BTC" : " Sats"}:{" "}
            {" " + btcSatHandler(totalAmount.toLocaleString(), btcMetric)}
          </p>

          <p
            style={{
              color: sectionColor,
            }}
            className="font-semibold text-lg"
          >
            USD: {amountUSDDisplay}
          </p>
        </div>
      </>
    );
  };

  const columns = useMemo(() => {
    const removeColumn = {
      header: "Remove",
      accessorKey: "remove",
      size: 100,
      enableSorting: false,
      Cell: ({ row, table }: { row: any; table: any }) => {
        const selectedRows = table.getState().rowSelection;
        return (
          <div className="flex items-center justify-center">
            <ActionIcon
              color="red"
              onClick={() => deleteUtxo(row.original.txid, selectedRows)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </div>
        );
      },
    };
    const defaultColumns = [
      {
        header: "Amount",
        accessorKey: "amount",
        size: 100,
        Cell: ({ row }: { row: any }) => {
          const amount = btcSatHandler(
            Number(row.original.amount).toFixed(2).toLocaleString(),
            btcMetric
          );
          return (
            <div>
              <p>
                {btcMetric === BtcMetric.BTC
                  ? amount
                  : Number(amount).toLocaleString()}
              </p>
            </div>
          );
        },
      },
      {
        header: "$ Amount",
        accessorKey: "amountUSD",
        size: 100,
        Cell: ({ row }: { row: any }) => {
          let amountUSD: string | undefined;

          const btcAmount = btcSatHandler(
            Number(row.original.amount).toLocaleString(),
            BtcMetric.BTC
          );

          try {
            amountUSD = Big(btcPrice).times(btcAmount).toFixed(0, Big.roundUp);
          } catch (e) {
            console.log("Error calculating amountUSD", e);
          }
          const amountUSDDisplay = amountUSD
            ? `$${Number(amountUSD).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`
            : "...";
          return (
            <div>
              <p>{amountUSDDisplay}</p>
            </div>
          );
        },
      },
      {
        header: "~ Fee %",
        accessorKey: "selfCost",
        size: 100,
        Cell: ({ row }: { row: any }) => {
          const feePct = row.original.amount
            ? `${calculateFeePercent(row.original.amount)}%`
            : "...";
          return (
            <div>
              <p> {feePct}</p>
            </div>
          );
        },
      },
      {
        header: "$ Fee",
        accessorKey: "feeUSD",
        size: 100,
        Cell: () => {
          let amountUSD: number | string | undefined;

          const btcAmount = btcSatHandler(
            Number(totalCost).toLocaleString(),
            BtcMetric.BTC
          );

          try {
            amountUSD = Big(btcPrice).times(btcAmount).toFixed(0, Big.roundUp);
          } catch (e) {
            console.log("error", e);
          }

          amountUSD = Number(amountUSD) < 1 ? 1 : Number(amountUSD);

          const amountUSDDisplay = amountUSD
            ? `$${amountUSD.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`
            : "...";
          return (
            <div>
              <p>{amountUSDDisplay}</p>
            </div>
          );
        },
      },
      {
        header: "Spendable",
        accessorKey: "Spendable",
        size: 25,
        Cell: ({ row }: { row: any }) => {
          const feePct = row.original.amount
            ? calculateFeePercent(row.original.amount)
            : null;

          const isSpendable = feePct === null ? "..." : Number(feePct) < 100;
          return (
            <div className="flex items-center justify-center">
              {isSpendable ? (
                <IconCircleCheck data-testid="spendable-icon" color="green" />
              ) : (
                <IconCircleX data-testid="not-spendable-icon" color="red" />
              )}
            </div>
          );
        },
      },
    ];

    return areRowsDeletable
      ? [removeColumn, ...defaultColumns]
      : defaultColumns;
  }, [btcMetric, btcPrice, totalCost, utxos]);

  const table = useMaterialReactTable({
    columns,
    data: utxos,
    enableRowSelection: areRowsSelectable,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableFilters: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableHiding: false,
    enablePagination: false,
    enableTableFooter: false,
    enableBottomToolbar: false,
    muiTableContainerProps: {
      className: "overflow-auto transition-all duration-300 ease-in-out",
      style: { maxHeight: areRowsSelectable ? "24rem" : "30rem" },
    },
    enableStickyHeader: true,
    enableTopToolbar: true,
    positionToolbarAlertBanner: "none",
    positionToolbarDropZone: "top",
    renderTopToolbarCustomActions: ({ table }) => {
      return (
        <div className="ml-2">
          <p
            style={{
              color: sectionColor,
            }}
            className="text-2xl font-semibold"
          >
            {title}
            <span className="text-lg"> (utxos)</span>
          </p>

          <Collapse
            in={opened && areRowsSelectable}
            transitionDuration={300}
            transitionTimingFunction="linear"
          >
            <DisplaySelectedUtxosData />
          </Collapse>
        </div>
      );
    },
    muiSelectCheckboxProps: {
      color: "primary",
    },
    initialState: {
      sorting: [
        {
          id: "amount",
          desc: false,
        },
      ],
    },

    state: { rowSelection },
    // @ts-ignore
    muiTableBodyRowProps: { classes: { root: { after: "bg-green-100" } } },

    muiTableBodyCellProps: ({ row }) => {
      const feeRatePct = row.original.amount
        ? calculateFeePercent(row.original.amount)
        : 0;
      const color = getFeeRateColor(Number(feeRatePct));

      return {
        style: { backgroundColor: color },
      };
    },

    getRowId: (originalRow) => {
      return originalRow.txid;
    },

    onRowSelectionChange: setRowSelection,
  });

  useEffect(() => {
    onRowSelection(getSelectedUtxos(rowSelection));
  }, [rowSelection]);

  useEffect(() => {
    const rowSelectionLength = Object.keys(rowSelection).length;
    if (rowSelectionLength > 0 && previousShowing === false) {
      toggle();
    }
    if (rowSelectionLength === 0 && previousShowing === true) {
      toggle();
    }
  }, [rowSelection]);

  return (
    <div>
      <ThemeProvider
        theme={createTheme({
          palette: {
            secondary: {
              main: "#339AF0",
              light: "#fff",
            },
          },
          components: {
            MuiTableRow: {
              styleOverrides: {
                root: {
                  "&.MuiTableRow-root td:after": {
                    backgroundColor: "rgb(255,255,255, 0.0)", // make the opcity 0 so that the color doesn't even show, it clashes too much with the color of the cell anyways so it isn't really needed
                  },
                  "&.MuiTableRow-root:hover td:after": {
                    backgroundColor: "rgb(225,225,225, 0.5)", // white with an opacity
                  },
                },
              },
            },
          },
        })}
      >
        <MaterialReactTable table={table} />
      </ThemeProvider>
    </div>
  );
};
