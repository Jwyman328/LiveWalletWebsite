import { useEffect, useState } from "react";
import { CurrentFeeRates } from "../components/currentFeeRates";
import { UtxosDisplay } from "../components/utxosDisplay";

import {
  Container,
  Group,
  Button,
  Slider,
  InputLabel,
  Select,
  SegmentedControl,
  ActionIcon,
  NumberInput,
  Collapse,
  Tooltip,
  RangeSlider,
  RangeSliderValue,
} from "@mantine/core";
import { BtcMetric } from "../types/btcSatHandler";
import { SettingsSlideout } from "../components/SettingsSlideout";
import { IconAdjustments, IconInfoCircle } from "@tabler/icons-react";
import { FeeRateColorChangeInputs } from "../components/FeeRateColorChangeInputs";
import {
  CreateTxFeeEstimationResponseType,
  GetBTCPriceResponseType,
  Utxo,
} from "../api/types";
import { notifications } from "@mantine/notifications";
import { useGetBtcPrice } from "../hooks/price";
import { useGetCurrentFees } from "../hooks/utxos";
import {
  multiSigScriptTypeOptions,
  PolicyTypeOption,
  policyTypeOptions,
  ScriptTypeOption,
  scriptTypeOptions,
  singleSigScriptTypeOptions,
} from "../components/formOptions";
import { PolicyTypes } from "../types/policyTypes";
import { useCurrentScreenWidth } from "../hooks/screenWidth";

export type ScaleOption = {
  value: string;
  label: string;
};

export type FeeRateColor = [number, string];
export enum TxMode {
  SINGLE = "SINGLE",
  BATCH = "BATCH",
  CONSOLIDATE = "CONSOLIDATE",
}
function Playground() {
  const getCurrentFeesQueryRequest = useGetCurrentFees();

  const [utxos, setUtxos] = useState<Utxo[]>([]);

  const [currentBatchedTxData, setCurrentBatchedTxData] = useState<
    CreateTxFeeEstimationResponseType | undefined | null
  >(null);
  const [btcMetric, setBtcMetric] = useState(BtcMetric.SATS);
  const [btcPrice, setBtcPrice] = useState(0);

  const [txMode, setTxMode] = useState(TxMode.SINGLE);

  const handleGetBtcPrice = (data: GetBTCPriceResponseType) => {
    const usdPrice = data.USD;
    setBtcPrice(usdPrice);
  };

  const getBtcPriceResponse = useGetBtcPrice({
    onSuccess: handleGetBtcPrice,
    onError: () => {
      notifications.show({
        title: "Fetching current btc price failed",
        message: "Please set the price manually.",
        color: "red",
      });
    },
  });

  const scaleOptions: ScaleOption[] = [
    { value: "100", label: "100" },
    { value: "1000", label: "1,000" },
    { value: "10000", label: "10,000" },
    { value: "100000", label: "100,000" },
    { value: "1000000", label: "1,000,000" },
  ];

  const minScaleOptions: ScaleOption[] = [
    { value: "0", label: "0" },
    { value: "100", label: "100" },
    { value: "1000", label: "1,000" },
    { value: "10000", label: "10,000" },
    { value: "100000", label: "100,000" },
  ];
  const [feeScale, setFeeScale] = useState(scaleOptions[1]);
  const [minFeeScale, setMinFeeScale] = useState(minScaleOptions[0]);
  const [feeRate, setFeeRate] = useState(parseInt("1"));

  // Initially set the current future fee rate to the current medium fee rate
  // Also always set the consolidation fee rate to the current medium fee rate.
  useEffect(() => {
    if (
      getCurrentFeesQueryRequest.isSuccess &&
      feeRate.toString() === minFeeScale.value
    ) {
      setFeeRate(parseInt(`${getCurrentFeesQueryRequest.data?.medium}`));
    }

    if (getCurrentFeesQueryRequest.isSuccess) {
      setConsolidationFeeRate(
        parseInt(`${getCurrentFeesQueryRequest.data?.medium}`)
      );
    }
  }, [getCurrentFeesQueryRequest.isSuccess]);

  const [feeRateColorMapValues, setFeeRateColorMapValues] = useState<
    FeeRateColor[]
  >([
    [0, "rgb(220, 252, 231)"],
    [5, "rgb(254, 240, 138)"],
    [
      25,
      "rgb(239, 68, 68)", // 'bg-red-500',
    ],
    [
      50,
      "rgb(220, 38, 38)", // 'bg-red-600',
    ],
    [
      75,
      "rgb(185, 28, 28)", // 'bg-red-700',
    ],
    [
      100,
      "rgb(153, 27, 27)", // 'bg-red-800',
    ],
  ]);

  const changeFeeRateColorPercent = (index: number, percent: number) => {
    const feeRateColorItem = feeRateColorMapValues[index];
    const newFeeRateColorItem = [percent, feeRateColorItem[1]] as [
      number,
      string
    ];
    const newFeeRateColorMapValues = [...feeRateColorMapValues];
    newFeeRateColorMapValues[index] = newFeeRateColorItem;

    setFeeRateColorMapValues(newFeeRateColorMapValues);
  };

  const changeFeeRateColor = (index: number, color: string) => {
    const feeRateColorItem = feeRateColorMapValues[index];
    const newFeeRateColorItem = [feeRateColorItem[0], color] as [
      number,
      string
    ];
    const newFeeRateColorMapValues = [...feeRateColorMapValues];
    newFeeRateColorMapValues[index] = newFeeRateColorItem;

    setFeeRateColorMapValues(newFeeRateColorMapValues);
  };
  const scaleColor = (r: number, g: number, b: number, scale: number) => {
    // Scale factor to increase the color intensity
    let newR = Math.min(255, Math.max(0, r + scale));
    let newG = Math.min(255, Math.max(0, g + scale));
    let newB = Math.min(255, Math.max(0, b + scale));

    return { r: newR, g: newG, b: newB };
  };

  const extractRGBValues = (rgb: string) => {
    // Regular expression to match 'rgb(r, g, b)'
    const regex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    const match = rgb.match(regex);

    if (match) {
      // Extract values from the matched groups
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      return { r, g, b };
    } else {
      throw new Error("Invalid RGB string format");
    }
  };

  const removeFeeRateColor = (index: number) => {
    const newFeeRateColorMapValues = [...feeRateColorMapValues];
    newFeeRateColorMapValues.splice(index, 1);
    setFeeRateColorMapValues(newFeeRateColorMapValues);
  };
  const addFeeRateColor = () => {
    const lastFeeRateColor =
      feeRateColorMapValues[feeRateColorMapValues.length - 1];
    const newFeeRateColorFeeRate = lastFeeRateColor[0] + 5;
    const lastFeeRateColorColor = lastFeeRateColor[1];
    const lastFeeRateColorRGB = extractRGBValues(lastFeeRateColorColor);
    const newFeeRateColorRGB = scaleColor(
      lastFeeRateColorRGB["r"],
      lastFeeRateColorRGB["g"],
      lastFeeRateColorRGB["b"],
      -10 // make color darker
    );
    const newFeeRateColorColor = `rgb(${newFeeRateColorRGB["r"]}, ${newFeeRateColorRGB["g"]}, ${newFeeRateColorRGB["b"]})`;
    const newFeeRateColorMapValue: FeeRateColor = [
      newFeeRateColorFeeRate,
      newFeeRateColorColor,
    ];

    const newFeeRateColorMapValues = [
      ...feeRateColorMapValues,
      newFeeRateColorMapValue,
    ];

    setFeeRateColorMapValues(newFeeRateColorMapValues);
  };
  const [signaturesNeeded, setSignaturesNeeded] = useState(1);
  const [numberOfXpubs, setNumberOfXpubs] = useState(1);

  const handleNofMChange = (value: RangeSliderValue) => {
    const M = value[0];
    const N = value[1];

    setSignaturesNeeded(M);
    setNumberOfXpubs(N);
  };

  const setMinFeeRate = (option: { value: string; label: string }) => {
    if (feeRate < Number(option.value)) {
      setFeeRate(Number(option.value));
    }
    if (Number(option.value) <= Number(feeScale.value)) {
      setMinFeeScale(option);
    } else {
      const minScaleOption = minScaleOptions.find(
        (scaleOption) => scaleOption.value === feeScale.value
      );
      if (minScaleOption) {
        setMinFeeScale(minScaleOption);
      }
    }
  };

  const handleFeeRateChange = (value: number) => {
    setFeeRate(value);
    if (txMode === TxMode.BATCH) {
      setCurrentBatchedTxData(null);
    }
  };

  const [scriptType, setScriptType] = useState<ScriptTypeOption>(
    scriptTypeOptions[0]
  );

  // switching txMode should clear batchTxData
  useEffect(() => {
    setCurrentBatchedTxData(null);
  }, [txMode]);

  useEffect(() => {
    setCurrentBatchedTxData(null);
  }, [utxos]);

  const diffBetweenMaxAndMinFeeRate =
    parseInt(feeScale.value) + parseInt(minFeeScale.value);
  const twentyFivePercent = Math.ceil(diffBetweenMaxAndMinFeeRate * 0.25);
  const fiftyPercent = Math.ceil(diffBetweenMaxAndMinFeeRate * 0.5);
  const seventyFivePercent = Math.ceil(diffBetweenMaxAndMinFeeRate * 0.75);
  const feeRateMarks =
    minFeeScale.value !== feeScale.value
      ? [
          { value: parseInt(minFeeScale.value), label: minFeeScale.value },
          { value: twentyFivePercent, label: twentyFivePercent.toString() },
          { value: fiftyPercent, label: fiftyPercent.toString() },
          { value: seventyFivePercent, label: seventyFivePercent.toString() },
          { value: parseInt(feeScale.value), label: feeScale.value },
        ]
      : [];

  const [isShowSettingsSlideout, setIsShowSettingsSlideout] = useState(false);
  const [consolidationFeeRate, setConsolidationFeeRate] = useState(1);
  const formItemWidth = "w-full";
  const labelWidth = "w-full";
  const onConsolidationFeeRate = (consolidationFeeRate: string | number) => {
    setConsolidationFeeRate(Number(consolidationFeeRate));
    setCurrentBatchedTxData(null);
  };
  const [policyType, setPolicyType] = useState<PolicyTypeOption>(
    policyTypeOptions[0]
  );

  const onBtcPriceChange = (netBtcPrice: string | number) => {
    setBtcPrice(Number(netBtcPrice));
  };

  const maxToggleContainerWidth =
    txMode !== TxMode.CONSOLIDATE ? { maxWidth: "1000px" } : {};

  const screenWidth = useCurrentScreenWidth();
  const isRenderable = screenWidth > 670;
  const headerClasses =
    screenWidth < 900 && txMode === TxMode.CONSOLIDATE
      ? "flex flex-col w-full justify-around items-center"
      : "flex flex-row w-full justify-around";

  return isRenderable ? (
    <div className="h-full overflow-y-scroll">
      <SettingsSlideout
        opened={isShowSettingsSlideout}
        onClose={() => setIsShowSettingsSlideout(false)}
      >
        <div className="flex w-full justify-start mt-4 flex-col ">
          <SegmentedControl
            className="mb-4"
            value={btcMetric.toString()}
            onChange={(value) => {
              const selectedValue =
                value === BtcMetric.BTC.toString()
                  ? BtcMetric.BTC
                  : BtcMetric.SATS;
              setBtcMetric(selectedValue);
            }}
            data={[BtcMetric.SATS.toString(), BtcMetric.BTC.toString()]}
          />

          <SegmentedControl
            className="mb-4"
            value={txMode}
            onChange={(value: string) => {
              setTxMode(value as TxMode);
            }}
            data={[TxMode.SINGLE, TxMode.BATCH, TxMode.CONSOLIDATE]}
          />
          <div className="h-full">
            <div className="flex flex-row justify-between mb-4">
              <Select
                className={"w-36"}
                data={minScaleOptions}
                value={minFeeScale.value}
                onChange={(_value, option) => setMinFeeRate(option)}
                label={<p>Min fee rate</p>}
              />

              <Select
                className={"w-36"}
                data={scaleOptions}
                value={feeScale.value}
                onChange={(_value, option) => setFeeScale(option)}
                label={<p>Max fee rate</p>}
              />
            </div>
          </div>
          <InputLabel className={`mt-0 mb-2 ${labelWidth}`}>
            Policy type
          </InputLabel>
          <Select
            placeholder="Select policy type"
            allowDeselect={false}
            className={formItemWidth}
            data={policyTypeOptions}
            value={policyType.value}
            onChange={(_value, option) => {
              if (option) {
                // If going from multi to single signature
                if (
                  option.value === PolicyTypes.SINGLE_SIGNATURE &&
                  policyType.value === PolicyTypes.MULTI_SIGNATURE
                ) {
                  setSignaturesNeeded(1);
                  setNumberOfXpubs(1);
                  setScriptType(singleSigScriptTypeOptions[2]);
                }

                // If going from single to multi signature
                if (
                  option.value === PolicyTypes.MULTI_SIGNATURE &&
                  policyType.value === PolicyTypes.SINGLE_SIGNATURE
                ) {
                  setSignaturesNeeded(2);
                  setNumberOfXpubs(3);

                  setScriptType(multiSigScriptTypeOptions[2]);
                }

                setPolicyType(option as PolicyTypeOption);
              }
            }}
          />

          <InputLabel className={`mt-4 ${labelWidth}`}>Script type</InputLabel>
          <Select
            data-testid="script-type-select"
            allowDeselect={false}
            className={`mb-0 ${formItemWidth}`}
            data={
              signaturesNeeded === 1 && numberOfXpubs === 1
                ? singleSigScriptTypeOptions
                : multiSigScriptTypeOptions
            }
            value={scriptType ? scriptType.value : null}
            onChange={(_value, option) => {
              if (option) {
                setScriptType(option as ScriptTypeOption);
              }
            }}
          />

          {policyType.value === PolicyTypes.MULTI_SIGNATURE && (
            <>
              <div
                className={`flex flex-row items-center ${labelWidth} mb-2 mt-4`}
              >
                <InputLabel className={`mr-1`}>M of N</InputLabel>
                <Tooltip
                  withArrow
                  w={300}
                  multiline
                  label="M is the number of signers and N is the number of xpubs. M must be less than or equal to N."
                >
                  <IconInfoCircle style={{ width: "14px", height: "14px" }} />
                </Tooltip>
              </div>
              <RangeSlider
                data-testid="m-of-n-slider"
                className="mt-0 mb-4 w-96"
                style={{ marginBottom: "2rem" }}
                minRange={0.2}
                min={1}
                max={9}
                step={1}
                marks={[
                  { value: 1, label: "1" },
                  { value: 2, label: "2" },
                  { value: 3, label: "3" },
                  { value: 4, label: "4" },
                  { value: 5, label: "5" },
                  { value: 6, label: "6" },
                  { value: 7, label: "7" },
                  { value: 8, label: "8" },
                  { value: 9, label: "9" },
                ]}
                defaultValue={[signaturesNeeded, numberOfXpubs]}
                onChange={handleNofMChange}
                label={null}
              />
            </>
          )}
        </div>
        <Collapse in={false}>
          <FeeRateColorChangeInputs
            numberOfInputs={feeRateColorMapValues.length}
            feeRateColorMapValues={feeRateColorMapValues}
            changeFeeRateColorPercent={changeFeeRateColorPercent}
            changeFeeRateColor={changeFeeRateColor}
            removeFeeRateColor={removeFeeRateColor}
            addFeeRateColor={addFeeRateColor}
          />
        </Collapse>
      </SettingsSlideout>

      <header className="border-2 border-gray-200 border-l-0 border-r-0 mb-2 h-16 mt-4">
        <Container size="xl" className="flex justify-between items-center h-16">
          <CurrentFeeRates />
          <Group gap={5} visibleFrom="xs">
            <ActionIcon
              onClick={() => setIsShowSettingsSlideout(true)}
              variant="filled"
              aria-label="Settings"
              data-testid="settings-button"
            >
              <IconAdjustments
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            </ActionIcon>
          </Group>
        </Container>
      </header>

      <div className="flex flex-row justify-evenly"></div>
      <div className="flex flex-col items-center overflow-x-scroll">
        <div className={headerClasses} style={maxToggleContainerWidth}>
          <Collapse
            in={txMode === TxMode.CONSOLIDATE}
            transitionDuration={300}
            transitionTimingFunction="linear"
          >
            <div className="flex flex-col items-center">
              <h1 className="text-center font-bold text-xl mt-4 mr-4 mb-2">
                Consolidation Tx Fee Rate (sat/vB)
              </h1>
              <NumberInput
                data-testid="consolidation-fee-rate-input"
                className={`mb-4 w-40 mt-2`}
                allowNegative={false}
                clampBehavior="strict"
                value={consolidationFeeRate}
                onChange={onConsolidationFeeRate}
                thousandSeparator=","
                min={1}
                max={10000000}
              />
            </div>
          </Collapse>
          <div>
            <h1 className="text-center font-bold text-xl mt-0">
              Future Fee Environment (sat/vB)
            </h1>
            <div className="mb-10">
              <div className="flex flex-row items-center ">
                <div
                  style={{ width: "30rem" }}
                  className="ml-8 mr-8 relative top-4"
                >
                  <Slider
                    data-testid="fee-rate-slider"
                    marks={feeRateMarks}
                    defaultValue={parseInt(minFeeScale.value)}
                    min={parseInt(minFeeScale.value)}
                    max={parseInt(feeScale.value)}
                    step={10}
                    value={feeRate}
                    onChange={handleFeeRateChange}
                    label={`${feeRate.toLocaleString()} sat/vB`}
                    thumbSize={26}
                    styles={{
                      track: { height: "16px" },
                      markLabel: { marginTop: "16px" },
                      mark: { height: "0px", display: "none" },
                    }}
                  />

                  <InputLabel className="text-center mt-6">
                    Fee rate: {feeRate.toLocaleString()} sat/vB
                  </InputLabel>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-2">
            <h1 className="text-center font-bold text-xl mt-4">BTC Price</h1>
            <NumberInput
              data-testid="btc-price-input"
              className={`mb-4 w-40 mt-2`}
              prefix="$"
              allowNegative={false}
              value={btcPrice}
              onChange={onBtcPriceChange}
              thousandSeparator=","
              min={1}
            />
          </div>
        </div>
        <div className="flex flex-col ">
          <UtxosDisplay
            feeRateColorValues={feeRateColorMapValues}
            btcMetric={btcMetric}
            feeRate={feeRate}
            utxos={utxos}
            walletType={scriptType.value}
            isLoading={getBtcPriceResponse.isLoading}
            isError={false}
            currentBatchedTxData={currentBatchedTxData}
            setCurrentBatchedTxData={setCurrentBatchedTxData}
            btcPrice={btcPrice}
            numberOfXpubs={numberOfXpubs}
            signaturesNeeded={signaturesNeeded}
            txMode={txMode}
            consolidationFeeRate={consolidationFeeRate}
            setUtxos={setUtxos}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="h-full text-center mt-8">
      Please use a larger screen to access the live wallet sandbox
    </div>
  );
}

export default Playground;
