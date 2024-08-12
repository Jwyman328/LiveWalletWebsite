import React from "react";

export const Home = () => {
  return (
    <div className="max-[1200px]:px-6 max-[1400px]:px-10 px-28 pt-4 w-screen bg-gray-100">
      <div className="flex flex-row max-[1000px]:flex-col mt-16 pl-0 max-[1400px]:pl-2">
        <div className="flex-1 mr-12 mb-4">
          <h2 className="text-2xl font-bold text-gray-700">Purpose</h2>
          <div>
            <p>
              Live Wallet is a desktop application to help users actively keep
              their UTXOs alive. Keeping UTXOs alive is not something that can
              be done once, but is a practice that involves active evaluation,
              management and action.
            </p>
            <p className="mt-4">
              Live Wallet currently helps users understand the current and
              future fee burden of a UTXO by displaying a wallet’s UTXOs and
              providing a customizable fee rate toggle. This feature allows
              users to set a hypothetical fee rate to estimate the potential fee
              burden of using each UTXO. The application highlights what
              percentage of the UTXO will be consumed by the fee, which at
              certain fee rates may exceed the UTXO’s total value, rendering it
              unspendable. Another component of UTXO health that resonates with
              people is understanding the fiat price of spending a UTXO. Live
              Wallet allows users to adjust the Bitcoin price, helping them
              answer questions like: 'If I have to pay 3000 sats/vbyte and the
              Bitcoin price is $1,000,000, how much USD will it cost to spend
              one of my UTXOs?'
            </p>

            <h2 className="text-2xl font-bold mt-4 text-gray-700">Features</h2>
            <ul className="list-disc ml-4">
              <li>Estimate UTXO fee burden at any fee rate.</li>
              <li>Estimate fee burden of a multi UTXO transaction.</li>
              <li>
                Estimate USD cost of a transaction at any USD/BTC price and fee
                rate.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex-1 mt-4 w-full h-auto mb-8">
          <video controls>
            <source src="LiveWalletDemo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};
