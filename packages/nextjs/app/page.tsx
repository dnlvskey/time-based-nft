"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, ClockIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Time-Based NFT</span>
            <span className="block text-xl font-bold">Dynamic NFTs that change with time</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <div className="flex items-center flex-col flex-grow pt-10">
            <div className="px-5">
              <h1 className="text-center mb-6">
                <span className="block text-2xl mb-2">🕐 Time-Based NFTs</span>
                <span className="block text-4xl font-bold">Dynamic Art that Lives with Time</span>
              </h1>
              <div className="flex flex-col items-center justify-center">
                <div className="max-w-3xl">
                  <p className="mt-8 text-lg">
                    🎨 Experience the magic of time-sensitive NFTs that transform based on your timezone. Each NFT
                    displays different visuals for Night (🌙), Morning (🌅), and Day (☀️) periods.
                  </p>
                  <p className="mt-4 text-lg">
                    🌍 Choose your timezone when minting, and watch your NFT evolve throughout the day. The artwork
                    adapts to your local time, creating a truly personalized and dynamic experience.
                  </p>
                  <div className="mt-8 text-center">
                    <Link href="/time-nft" className="btn btn-primary btn-lg">
                      🚀 Start Minting
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ClockIcon className="h-8 w-8 fill-secondary" />
              <p>
                Mint your time-based NFT with the{" "}
                <Link href="/time-nft" passHref className="link">
                  Time NFT
                </Link>{" "}
                interface.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Interact with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
