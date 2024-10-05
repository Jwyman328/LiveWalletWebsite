import React, { useEffect, useState } from "react";
import {
  CreateTxFeeEstimationResponseType,
  UtxoRequestParamWithAmount,
} from "../api/types";
import { Utxo } from "../api/types";
import {
  Button,
  Tooltip,
  LoadingOverlay,
  NumberInput,
  InputLabel,
  Collapse,
} from "@mantine/core";
import { ScriptTypes } from "../types/scriptTypes";
import Big from "big.js";
import { IconInfoCircle } from "@tabler/icons-react";
import { BtcMetric, btcSatHandler } from "../types/btcSatHandler";
import { UtxoTable } from "./utxoTable";
import { TxMode } from "../pages/Playground";
import { createTxFeeEstimate } from "../bitcoin/txFeeCalculation";

const sectionColor = "rgb(1, 67, 97)";

const sectionHeaderStyles = {
  fontSize: "1.5rem",
  color: sectionColor,
  fontWeight: "600",
};

const sectionLabelStyles = {
  fontSize: "1.125rem",
  color: sectionColor,
  fontWeight: "600",
};

type UtxosDisplayProps = {
  utxos: Utxo[];
  feeRate: number;
  walletType: ScriptTypes;
  isLoading: boolean;
  isError: boolean;
  btcMetric: BtcMetric;
  feeRateColorValues: [number, string][];
  currentBatchedTxData: CreateTxFeeEstimationResponseType | undefined | null;
  setCurrentBatchedTxData: React.Dispatch<
    React.SetStateAction<CreateTxFeeEstimationResponseType | undefined | null>
  >;
  btcPrice: number;
  signaturesNeeded: number;
  numberOfXpubs: number;
  txMode: TxMode;
  consolidationFeeRate: number;
  setUtxos: any;
};

export const UtxosDisplay = ({
  utxos,
  feeRate,
  walletType,
  isLoading,
  isError,
  btcMetric,
  feeRateColorValues,
  currentBatchedTxData,
  setCurrentBatchedTxData,
  btcPrice,
  signaturesNeeded,
  numberOfXpubs,
  txMode,
  consolidationFeeRate,
  setUtxos,
}: UtxosDisplayProps) => {
  const startingReceivingOutputCount = txMode === TxMode.CONSOLIDATE ? 1 : 2;
  const [receivingOutputCount, setReceivingOutputCount] = useState(
    startingReceivingOutputCount
  );
  const [consolidationUtxo, setConsolidationUtxo] = useState<Utxo[]>([]);
  const [isSavePSBTEnabled, setIsSavePSBTEnabled] = useState(false);

  const [selectedUtxos, setSelectedUtxos] = useState<
    UtxoRequestParamWithAmount[]
  >([]);

  const estimateIt = () => {
    const realFeeRate =
      txMode === TxMode.CONSOLIDATE ? consolidationFeeRate : feeRate;
    const outputCount =
      txMode === TxMode.CONSOLIDATE ? 1 : receivingOutputCount;

    const fee = createTxFeeEstimate(
      selectedUtxos.length,
      walletType,
      signaturesNeeded,
      numberOfXpubs,
      outputCount
    );
    const response: CreateTxFeeEstimationResponseType = {
      spendable: true,
      fee: fee * realFeeRate,
      psbt: "",
    };
    return response;
  };

  // switching selectedUtxos should clear current batchTxData
  useEffect(() => {
    setCurrentBatchedTxData(null);
  }, [selectedUtxos]);

  // switching to consolidation mode, should clear the consolidation data.
  // changing seelctedUtxos length or the consolidationFeeRate should also clear the consolidation data.
  useEffect(() => {
    if (txMode === TxMode.CONSOLIDATE) {
      setIsSavePSBTEnabled(false);
      setConsolidationUtxo([]);
    }
  }, [consolidationFeeRate, selectedUtxos.length, txMode]);

  const onReceivingOutputChange = (value: number) => {
    setReceivingOutputCount(value);
    // reset the current batched tx data
    // since a new output count will change the batch fee estimate
    // and thefore the current fee estimate will be invalid.
    setCurrentBatchedTxData(null);
  };

  const getFeeRateColor = (amount: number) => {
    const feeRateColorMap: Record<number, string> = {};

    for (let i = 0; i < feeRateColorValues.length; i++) {
      if (feeRateColorValues[i] && feeRateColorValues[i].length >= 2) {
        feeRateColorMap[feeRateColorValues[i][0]] = feeRateColorValues[i][1];
      }
    }
    let selectedColor = feeRateColorMap[0];

    for (const key in feeRateColorMap) {
      if (amount > Number(key)) {
        selectedColor = feeRateColorMap[key];
      }
    }
    return selectedColor;
  };

  const onRowSelection = (utxosSelected: UtxoRequestParamWithAmount[]) => {
    setSelectedUtxos(utxosSelected);
  };

  const calculateFeeEstimate = async () => {
    try {
      const response = estimateIt();
      setCurrentBatchedTxData(response);
      if (txMode === TxMode.CONSOLIDATE) {
        setIsSavePSBTEnabled(true);

        const totalAmount =
          selectedUtxos.reduce((accumulator, currentObject) => {
            return accumulator + currentObject.amount;
          }, 0) - response?.fee;
        const batchedUtxos =
          selectedUtxos.length > 1 && response
            ? [{ amount: totalAmount, vout: 0, txid: "mockTxId" }]
            : [];
        setConsolidationUtxo(batchedUtxos);
      }
    } catch (e) {
      console.log("Error calculating fee estimate", e);
    }
  };

  const DisplayBatchTxData = () => {
    const borderClasses = "p-2";
    if (!currentBatchedTxData || !selectedUtxos?.length) {
      return (
        <div className={borderClasses}>
          <p style={sectionLabelStyles}>Total fees: ...</p>
          <p style={sectionLabelStyles}>Fee cost: ...</p>
        </div>
      );
    }
    const utxoInputTotal = selectedUtxos.reduce(
      (total, utxo) => total + utxo.amount,
      0
    );

    const fee = currentBatchedTxData.fee;
    const percentOfTxFee = fee
      ? (Number(fee / utxoInputTotal) * 100).toFixed(4)
      : undefined;

    const feeInBtc = fee
      ? btcSatHandler(Number(fee).toLocaleString(), BtcMetric.BTC)
      : undefined;
    const feeUsdAmount = feeInBtc
      ? // @ts-ignore
        Big(btcPrice).times(feeInBtc).toFixed(0, Big.ROUND_UP)
      : undefined;

    const isSpendable = true;
    const bgColor = getFeeRateColor(Number(percentOfTxFee));

    return isSpendable ? (
      <div className={borderClasses} style={{ backgroundColor: bgColor }}>
        <p style={sectionLabelStyles}>
          {/* @ts-ignore */}
          Total fees: ~{btcSatHandler(fee.toLocaleString(), btcMetric)}
          {btcMetric === BtcMetric.BTC ? " BTC" : " sats"}
        </p>
        <p style={sectionLabelStyles}>
          Fee cost: $
          {Number(feeUsdAmount).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}{" "}
          <span className="ml-3">({percentOfTxFee}%)</span>
        </p>
      </div>
    ) : (
      <div
        className={`flex items-center justify-center bg-red-600 ${borderClasses}`}
      >
        <p className="text-white font-bold">Not Spendable</p>
      </div>
    );
  };

  return (
    <div className={"w-full mb-1 ml-1"}>
      <div className="relative flex flex-row ">
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />

        <LoadingOverlay
          visible={isError && !isLoading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 5 }}
          loaderProps={{
            children: (
              <p className="text-red-700 font-bold text-lg">
                Error fetching utxos, please log out and try again.
              </p>
            ),
          }}
        />
        <div className="flex flex-row">
          <UtxoTable
            utxos={utxos}
            areRowsSelectable={
              txMode === TxMode.BATCH || txMode === TxMode.CONSOLIDATE
            }
            onRowSelection={onRowSelection}
            walletType={walletType}
            signaturesNeeded={signaturesNeeded}
            numberOfXpubs={numberOfXpubs}
            receivingOutputCount={receivingOutputCount}
            feeRate={feeRate}
            getFeeRateColor={getFeeRateColor}
            btcPrice={btcPrice}
            btcMetric={btcMetric}
            isShowTxId={false}
            setUtxos={setUtxos}
            areRowsDeletable={true}
          />

          {txMode === TxMode.CONSOLIDATE && (
            <div className="ml-4 flex flex-col justify-between">
              <UtxoTable
                utxos={consolidationUtxo}
                areRowsSelectable={false}
                onRowSelection={() => {}}
                walletType={walletType}
                signaturesNeeded={signaturesNeeded}
                numberOfXpubs={numberOfXpubs}
                receivingOutputCount={1}
                feeRate={feeRate}
                getFeeRateColor={getFeeRateColor}
                btcPrice={btcPrice}
                btcMetric={btcMetric}
                title="Output"
                isShowTxId={false}
                setUtxos={setUtxos}
                areRowsDeletable={false}
              />

              <div className="mt-auto">
                <InputLabel
                  style={sectionHeaderStyles}
                  className="font-semibold mt-2 mr-1"
                >
                  {txMode === TxMode.CONSOLIDATE ? "Consolidation " : ""}
                  Fees
                </InputLabel>

                <DisplayBatchTxData />
              </div>
            </div>
          )}
        </div>

        <div
          style={{ minWidth: txMode !== TxMode.CONSOLIDATE ? "100px" : "0px" }}
          className=" flex flex-col ml-6"
        >
          <Collapse
            in={txMode !== TxMode.CONSOLIDATE}
            transitionDuration={300}
            transitionTimingFunction="linear"
          >
            <>
              <InputLabel
                style={sectionHeaderStyles}
                className="font-semibold mt-0 mr-1"
              >
                Outputs
              </InputLabel>
              <div className={`flex flex-row items-center`}>
                <InputLabel
                  style={sectionLabelStyles}
                  className="font-semibold mt-0 mr-1"
                >
                  Count
                </InputLabel>

                <Tooltip
                  withArrow
                  w={300}
                  multiline
                  label="A bitcoin transaction typically has 2 outputs, one to the payee's address and one back to the payer's change address. If you are estimating sending to multiple payees, you can increase this number. If you are estimating a consolidation transaction you can set the count to 1.
                "
                >
                  <IconInfoCircle
                    style={{
                      width: "14px",
                      height: "14px",
                      color: sectionColor,
                    }}
                  />
                </Tooltip>
              </div>
              <NumberInput
                data-testid="output-count"
                className={`mb-4 w-40 mt-2`}
                style={sectionLabelStyles}
                allowNegative={false}
                clampBehavior="strict"
                value={receivingOutputCount}
                // @ts-ignore
                onChange={onReceivingOutputChange}
                thousandSeparator=","
                min={1}
                max={5000}
              />
            </>
          </Collapse>

          <div className="mt-auto">
            <Collapse
              in={txMode === TxMode.BATCH}
              transitionDuration={300}
              transitionTimingFunction="linear"
            >
              <InputLabel
                style={sectionHeaderStyles}
                className="font-semibold mt-0 mr-1"
              >
                Fees
              </InputLabel>

              <DisplayBatchTxData />
            </Collapse>
          </div>
        </div>
      </div>

      <Collapse
        in={txMode === TxMode.BATCH || txMode === TxMode.CONSOLIDATE}
        transitionDuration={300}
        transitionTimingFunction="linear"
      >
        <div className="flex flex-row mt-4 mb-4 h-14">
          <Button
            fullWidth
            disabled={
              selectedUtxos?.length < 2 ||
              (txMode === TxMode.CONSOLIDATE && isSavePSBTEnabled)
            }
            onClick={calculateFeeEstimate}
            size="xl"
            style={{
              height: "100%",
              borderColor: selectedUtxos?.length < 2 ? "#b8b8b8" : undefined,
              borderWidth: selectedUtxos?.length < 2 ? "2px" : undefined,
              transition: "background-color 0.3s ease",
            }}
          >
            {txMode === TxMode.CONSOLIDATE ? "Consolidate" : "Estimate Batch"}
          </Button>
        </div>
      </Collapse>
    </div>
  );
};
