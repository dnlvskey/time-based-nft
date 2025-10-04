"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const TimeNFT: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [timezoneOffset, setTimezoneOffset] = useState(0);
  const [isMinting, setIsMinting] = useState(false);

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "TimeBasedNFT",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "TimeBasedNFT",
    functionName: "totalSupply",
  });

  const handleMint = async () => {
    if (!writeContractAsync) return;

    setIsMinting(true);
    try {
      await writeContractAsync({
        functionName: "mint",
        args: [BigInt(timezoneOffset)],
        value: parseEther("0.01"),
      });
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setIsMinting(false);
    }
  };

  const timezones = [
    { name: "UTC-12 (Baker Island)", offset: -720 },
    { name: "UTC-11 (American Samoa)", offset: -660 },
    { name: "UTC-10 (Hawaii)", offset: -600 },
    { name: "UTC-9 (Alaska)", offset: -540 },
    { name: "UTC-8 (Pacific Time)", offset: -480 },
    { name: "UTC-7 (Mountain Time)", offset: -420 },
    { name: "UTC-6 (Central Time)", offset: -360 },
    { name: "UTC-5 (Eastern Time)", offset: -300 },
    { name: "UTC-4 (Atlantic Time)", offset: -240 },
    { name: "UTC-3 (Brazil)", offset: -180 },
    { name: "UTC-2 (Mid-Atlantic)", offset: -120 },
    { name: "UTC-1 (Azores)", offset: -60 },
    { name: "UTC+0 (London)", offset: 0 },
    { name: "UTC+1 (Paris)", offset: 60 },
    { name: "UTC+2 (Cairo)", offset: 120 },
    { name: "UTC+3 (Moscow)", offset: 180 },
    { name: "UTC+4 (Dubai)", offset: 240 },
    { name: "UTC+5 (Karachi)", offset: 300 },
    { name: "UTC+6 (Dhaka)", offset: 360 },
    { name: "UTC+7 (Bangkok)", offset: 420 },
    { name: "UTC+8 (Beijing)", offset: 480 },
    { name: "UTC+9 (Tokyo)", offset: 540 },
    { name: "UTC+10 (Sydney)", offset: 600 },
    { name: "UTC+11 (Noumea)", offset: 660 },
    { name: "UTC+12 (Fiji)", offset: 720 },
  ];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Time-Based NFT</span>
            <span className="block text-xl font-bold">Dynamic NFTs that change with time</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            {connectedAddress ? (
              <Address address={connectedAddress} />
            ) : (
              <div className="text-center">
                <p className="text-red-500 mb-2">No wallet connected</p>
                <p className="text-sm text-gray-600">Please connect your wallet to mint NFTs</p>
              </div>
            )}

            <div className="mt-4 p-3 bg-base-200 rounded-lg">
              <p className="text-sm font-medium mb-1">Status:</p>
              <p className="text-lg">Ready to mint</p>
            </div>
          </div>

          <div className="flex items-center flex-col flex-grow pt-10">
            <div className="px-5 max-w-4xl">
              <h2 className="text-center mb-6">
                <span className="block text-2xl mb-2">Mint Your Time-Based NFT</span>
                <span className="block text-lg text-gray-600">Choose your timezone and mint a dynamic NFT</span>
              </h2>

              <div className="bg-base-100 p-8 rounded-3xl shadow-lg">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Your Timezone:</label>
                  <select
                    value={timezoneOffset}
                    onChange={e => setTimezoneOffset(parseInt(e.target.value))}
                    className="select select-bordered w-full"
                  >
                    {timezones.map(tz => (
                      <option key={tz.offset} value={tz.offset}>
                        {tz.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    Your NFT will change appearance based on the time in your selected timezone:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                      <div className="text-2xl mb-2">🌙</div>
                      <div className="font-semibold">Night</div>
                      <div className="text-sm text-gray-600">22:00 - 06:00</div>
                    </div>
                    <div className="text-center p-4 bg-orange-100 rounded-lg">
                      <div className="text-2xl mb-2">🌅</div>
                      <div className="font-semibold">Morning</div>
                      <div className="text-sm text-gray-600">06:00 - 12:00</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-100 rounded-lg">
                      <div className="text-2xl mb-2">☀️</div>
                      <div className="font-semibold">Day</div>
                      <div className="text-sm text-gray-600">12:00 - 22:00</div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  {!connectedAddress ? (
                    <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                      <p className="text-yellow-800 font-medium mb-2">🔗 Connect your wallet to start minting</p>
                      <p className="text-sm text-yellow-700">
                        Use the &quot;Connect Wallet&quot; button in the top right corner
                      </p>
                    </div>
                  ) : (
                    <button onClick={handleMint} disabled={isMinting} className="btn btn-primary btn-lg">
                      {isMinting ? "Minting..." : "Mint NFT (0.01 ETH)"}
                    </button>
                  )}
                  {totalSupply !== undefined && (
                    <p className="mt-4 text-sm text-gray-600">Total minted: {totalSupply.toString()} / 1000</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeNFT;
