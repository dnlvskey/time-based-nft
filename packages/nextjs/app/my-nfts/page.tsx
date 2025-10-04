"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/* eslint-disable @next/next/no-img-element */

const MyNFTs: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get user's NFT balance
  const { data: userBalance } = useScaffoldReadContract({
    contractName: "TimeBasedNFT",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Get total supply
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "TimeBasedNFT",
    functionName: "totalSupply",
  });

  // Get all available token IDs
  const getAllTokenIds = () => {
    if (!totalSupply) return [];
    const tokenIds = [];
    for (let i = 1; i <= Number(totalSupply); i++) {
      tokenIds.push(i);
    }
    return tokenIds;
  };

  // NFT Tile Component for grid display
  const NFTTile = ({ tokenId }: { tokenId: number }) => {
    const { data: tokenURI } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });

    const { data: currentState } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "getCurrentTimeState",
      args: [BigInt(tokenId)],
    });

    const { data: timezone } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "tokenTimezones",
      args: [BigInt(tokenId)],
    });

    const { data: owner } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });

    const { data: detailedTimeInfo } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "getDetailedTimeInfo",
      args: [BigInt(tokenId)],
    });

    const getStateName = (state: number) => {
      switch (state) {
        case 0:
          return "Night";
        case 1:
          return "Morning";
        case 2:
          return "Day";
        default:
          return "Unknown";
      }
    };

    const getStateEmoji = (state: number) => {
      switch (state) {
        case 0:
          return "🌙";
        case 1:
          return "🌅";
        case 2:
          return "☀️";
        default:
          return "❓";
      }
    };

    const getStateColor = (state: number) => {
      switch (state) {
        case 0:
          return "badge-primary";
        case 1:
          return "badge-warning";
        case 2:
          return "badge-accent";
        default:
          return "badge-ghost";
      }
    };

    const formatTimezoneOffset = (offsetMinutes: bigint) => {
      const minutes = Number(offsetMinutes);
      const hours = Math.floor(Math.abs(minutes) / 60);
      const remainingMinutes = Math.abs(minutes) % 60;
      const sign = minutes >= 0 ? "+" : "-";

      if (remainingMinutes === 0) {
        return `UTC${sign}${hours}`;
      } else {
        return `UTC${sign}${hours}:${remainingMinutes.toString().padStart(2, "0")}`;
      }
    };

    const parseTokenURI = (uri: string) => {
      try {
        if (uri && uri.startsWith("data:application/json;base64,")) {
          const base64Data = uri.replace("data:application/json;base64,", "");
          const jsonData = atob(base64Data);
          return JSON.parse(jsonData);
        }
        return null;
      } catch (error) {
        console.error("Error parsing token URI:", error);
        return null;
      }
    };

    const metadata = tokenURI ? parseTokenURI(tokenURI) : null;

    // Don't render if token doesn't exist or no data loaded yet
    if (!owner || !tokenURI) {
      return (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <div className="flex justify-center items-center h-32">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="card-body p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="card-title text-lg">#{tokenId}</h3>
            {currentState !== undefined && (
              <div className={`badge ${getStateColor(Number(currentState))} text-xs`}>
                {getStateEmoji(Number(currentState))} {getStateName(Number(currentState))}
              </div>
            )}
          </div>

          {metadata?.image && (
            <div className="flex justify-center mb-3">
              <div className="border border-base-300 rounded-lg p-1 bg-white">
                <img
                  src={metadata.image}
                  alt={`NFT #${tokenId}`}
                  className="w-32 h-32 rounded-lg object-cover"
                  style={{ imageRendering: "auto" }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm">
            {timezone !== undefined && (
              <div className="flex justify-between">
                <span className="font-medium">Timezone:</span>
                <span className="text-xs">{formatTimezoneOffset(timezone)}</span>
              </div>
            )}

            {detailedTimeInfo && (
              <div className="bg-base-200 p-2 rounded text-xs">
                <div className="flex justify-between">
                  <span>Local:</span>
                  <span className="font-mono">
                    {detailedTimeInfo[3]?.toString().padStart(2, "0")}:
                    {detailedTimeInfo[4]?.toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>UTC:</span>
                  <span className="font-mono">
                    {detailedTimeInfo[1]?.toString().padStart(2, "0")}:
                    {detailedTimeInfo[2]?.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="card-actions justify-end mt-3">
            <button onClick={() => setSelectedTokenId(tokenId)} className="btn btn-sm btn-primary">
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // NFT Viewer Component for a specific token ID (detailed view)
  const NFTViewer = ({ tokenId }: { tokenId: number }) => {
    const [refreshTime, setRefreshTime] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data: tokenURI, refetch: refetchTokenURI } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });

    const { data: currentState, refetch: refetchCurrentState } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "getCurrentTimeState",
      args: [BigInt(tokenId)],
    });

    const { data: timezone } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "tokenTimezones",
      args: [BigInt(tokenId)],
    });

    const { data: owner } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });

    const { data: detailedTimeInfo, refetch: refetchDetailedTimeInfo } = useScaffoldReadContract({
      contractName: "TimeBasedNFT",
      functionName: "getDetailedTimeInfo",
      args: [BigInt(tokenId)],
    });

    const getStateName = (state: number) => {
      switch (state) {
        case 0:
          return "Night";
        case 1:
          return "Morning";
        case 2:
          return "Day";
        default:
          return "Unknown";
      }
    };

    const getStateEmoji = (state: number) => {
      switch (state) {
        case 0:
          return "🌙";
        case 1:
          return "🌅";
        case 2:
          return "☀️";
        default:
          return "❓";
      }
    };

    const getStateColor = (state: number) => {
      switch (state) {
        case 0:
          return "badge-primary";
        case 1:
          return "badge-warning";
        case 2:
          return "badge-accent";
        default:
          return "badge-ghost";
      }
    };

    const formatTimezoneOffset = (offsetMinutes: bigint) => {
      const minutes = Number(offsetMinutes);
      const hours = Math.floor(Math.abs(minutes) / 60);
      const remainingMinutes = Math.abs(minutes) % 60;
      const sign = minutes >= 0 ? "+" : "-";

      if (remainingMinutes === 0) {
        return `UTC${sign}${hours}`;
      } else {
        return `UTC${sign}${hours}:${remainingMinutes.toString().padStart(2, "0")}`;
      }
    };

    const parseTokenURI = (uri: string) => {
      try {
        if (uri && uri.startsWith("data:application/json;base64,")) {
          const base64Data = uri.replace("data:application/json;base64,", "");
          const jsonData = atob(base64Data);
          return JSON.parse(jsonData);
        }
        return null;
      } catch (error) {
        console.error("Error parsing token URI:", error);
        return null;
      }
    };

    const metadata = tokenURI ? parseTokenURI(tokenURI) : null;
    const isOwned = owner?.toLowerCase() === connectedAddress?.toLowerCase();

    if (!owner) {
      return (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Token #{tokenId}</h2>
            <p className="text-gray-500">This token does not exist</p>
          </div>
        </div>
      );
    }

    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-between">
            <span>Time NFT #{tokenId}</span>
            {currentState !== undefined && (
              <div className={`badge ${getStateColor(Number(currentState))}`}>
                {getStateEmoji(Number(currentState))} {getStateName(Number(currentState))}
              </div>
            )}
          </h2>

          {metadata?.image && (
            <div className="flex justify-center mb-4">
              <div className="border-2 border-base-300 rounded-lg p-2 bg-white">
                <img
                  src={metadata.image}
                  alt={`NFT #${tokenId}`}
                  className="w-80 h-80 rounded-lg"
                  style={{ imageRendering: "auto" }}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Owner:</span>
              <div className="flex items-center space-x-2">
                <Address address={owner} />
                {isOwned && <div className="badge badge-success badge-sm">You</div>}
              </div>
            </div>

            {timezone !== undefined && (
              <div className="flex justify-between">
                <span className="font-semibold">Timezone:</span>
                <span>{formatTimezoneOffset(timezone)}</span>
              </div>
            )}

            {detailedTimeInfo && (
              <div className="bg-base-200 p-3 rounded-lg">
                <span className="font-semibold">Real Time Information:</span>
                <div className="text-sm space-y-1 mt-1">
                  <div className="flex justify-between">
                    <span>Local Time:</span>
                    <span className="font-mono">
                      {detailedTimeInfo[3]?.toString().padStart(2, "0")}:
                      {detailedTimeInfo[4]?.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>UTC Time:</span>
                    <span className="font-mono">
                      {detailedTimeInfo[1]?.toString().padStart(2, "0")}:
                      {detailedTimeInfo[2]?.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timezone:</span>
                    <span>{formatTimezoneOffset(detailedTimeInfo[5] || BigInt(0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current State:</span>
                    <span className="font-semibold">{detailedTimeInfo[7]}</span>
                  </div>
                </div>
              </div>
            )}

            {metadata?.description && (
              <div>
                <span className="font-semibold">Description:</span>
                <p className="text-sm mt-1">{metadata.description}</p>
              </div>
            )}

            {metadata?.attributes && (
              <div>
                <span className="font-semibold">Attributes:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {metadata.attributes.map((attr: any, index: number) => (
                    <div key={index} className="badge badge-outline">
                      {attr.trait_type}: {attr.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card-actions justify-between mt-4">
            <div className="text-xs text-gray-500">Last updated: {refreshTime.toLocaleTimeString()}</div>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  setRefreshTime(new Date());
                  try {
                    await Promise.all([refetchTokenURI(), refetchCurrentState(), refetchDetailedTimeInfo()]);
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                className="btn btn-sm btn-outline"
                disabled={isRefreshing}
              >
                {isRefreshing ? "🔄 Refreshing..." : "🔄 Refresh"}
              </button>
              <button
                onClick={() => {
                  if (metadata?.image) {
                    const link = document.createElement("a");
                    link.href = metadata.image;
                    link.download = `time-nft-${tokenId}.svg`;
                    link.click();
                  }
                }}
                className="btn btn-sm btn-outline"
                disabled={!metadata?.image}
              >
                Download SVG
              </button>
              <button onClick={() => window.open(`/debug`, "_blank")} className="btn btn-sm btn-primary">
                Debug Contract
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        <div className="px-5 max-w-6xl w-full">
          <h1 className="text-center mb-8">
            <span className="block text-3xl mb-2">Time-Based NFT Collection</span>
            <span className="block text-xl font-bold text-gray-600">Explore dynamic NFTs</span>
          </h1>

          <div className="flex justify-center items-center space-x-2 flex-col mb-8">
            <p className="my-2 font-medium">Connected Address:</p>
            {connectedAddress ? (
              <Address address={connectedAddress} />
            ) : (
              <div className="text-center">
                <p className="text-red-500 mb-2">No wallet connected</p>
                <p className="text-sm text-gray-600">Connect your wallet to see which NFTs you own</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="stats shadow mb-8 w-full">
            <div className="stat">
              <div className="stat-title">Your NFTs</div>
              <div className="stat-value">{userBalance?.toString() || "—"}</div>
              <div className="stat-desc">Owned by your wallet</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Supply</div>
              <div className="stat-value">{totalSupply?.toString() || "—"}</div>
              <div className="stat-desc">Total minted NFTs</div>
            </div>
            <div className="stat">
              <div className="stat-title">Status</div>
              <div className="stat-value text-lg">Active</div>
              <div className="stat-desc">NFTs change based on time</div>
            </div>
          </div>

          {/* NFT Grid Display */}
          {getAllTokenIds().length > 0 ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">All Time-Based NFTs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getAllTokenIds().map(tokenId => (
                  <NFTTile key={`nft-${tokenId}`} tokenId={tokenId} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="mb-4 p-6 bg-blue-100 border border-blue-400 rounded-lg max-w-md mx-auto">
                <p className="text-blue-800 font-medium mb-2">🎨 No NFTs have been minted yet</p>
                <p className="text-sm text-blue-700 mb-4">Be the first to mint a Time-Based NFT!</p>
                <a href="/time-nft" className="btn btn-primary">
                  Mint First NFT
                </a>
              </div>
            </div>
          )}

          {/* Detailed NFT View Modal */}
          {selectedTokenId && totalSupply && Number(totalSupply) > 0 && (
            <div className="modal modal-open">
              <div className="modal-box max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">NFT Details</h3>
                  <button onClick={() => setSelectedTokenId(0)} className="btn btn-sm btn-circle btn-ghost">
                    ✕
                  </button>
                </div>
                <NFTViewer tokenId={selectedTokenId} />
              </div>
              <div className="modal-backdrop" onClick={() => setSelectedTokenId(0)}></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center mt-8">
            <div className="flex justify-center space-x-4">
              <a href="/time-nft" className="btn btn-primary">
                Mint New NFT
              </a>
              <a href="/debug" className="btn btn-secondary">
                Debug Contract
              </a>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-base-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">How Time-Based NFTs Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-base-100 rounded-lg">
                <div className="text-2xl mb-2">🌙</div>
                <div className="font-semibold">Night (22:00 - 06:00)</div>
                <div className="text-sm text-gray-600">Mystical dark theme with glowing effects</div>
              </div>
              <div className="text-center p-4 bg-base-100 rounded-lg">
                <div className="text-2xl mb-2">🌅</div>
                <div className="font-semibold">Morning (06:00 - 12:00)</div>
                <div className="text-sm text-gray-600">Warm sunrise colors with gentle light</div>
              </div>
              <div className="text-center p-4 bg-base-100 rounded-lg">
                <div className="text-2xl mb-2">☀️</div>
                <div className="font-semibold">Day (12:00 - 22:00)</div>
                <div className="text-sm text-gray-600">Bright sunny theme with vibrant colors</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Each NFT changes its appearance based on the time in the timezone it was minted with. Refresh the page to
              see the current state!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyNFTs;
