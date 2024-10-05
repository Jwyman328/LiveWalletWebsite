import { useGetCurrentFees } from "../hooks/utxos";
export const CurrentFeeRates = () => {
  //const getCurrentFeesQueryRequest = useGetCurrentFees();
  const feeRates = [
    { title: "Low", value: 4 },
    { title: "Medium", value: 5 },
    { title: "High", value: 6 },
  ];

  const Fee = ({ title, rate }: { title: string; rate: string }) => {
    return (
      <div className=" w-20 p-1  text-center">
        <p className="font-semibold">{title}</p>
        <p>
          {rate} <span className="text-gray-500 text-xs">sat/vB</span>{" "}
        </p>
      </div>
    );
  };

  return (
    <div className="mt-0">
      {true ? (
        <div className="ml-auto mr-auto">
          <div className="flex flex-row mt-1 mb-2 justify-between items-center ">
            <h2 className="font-semibold text-md text-center w-12 mr-5 text-center">
              Current fees
            </h2>
            {feeRates.map((feeRate) => (
              <Fee
                title={feeRate.title}
                rate={feeRate?.value?.toString() || ""}
              />
            ))}
          </div>
        </div>
      ) : null}
      {false ? (
        <p className="text-red-400"> Error fetch current fee rates </p>
      ) : null}
    </div>
  );
};
