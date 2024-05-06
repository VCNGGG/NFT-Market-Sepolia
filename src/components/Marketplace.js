import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function Marketplace() {
  const sampleData = [
    {
      name: "NFT#1",
      description: "",
      website: "http://axieinfinity.io",
      image: "",
      price: "0.03ETH",
      currentlySelling: "True",
      address: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
    },
    {
      name: "NFT#2",
      description: "",
      website: "http://axieinfinity.io",
      image: "",
      price: "0.03ETH",
      currentlySelling: "True",
      address: "0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    },
    {
      name: "NFT#3",
      description: "",
      website: "http://axieinfinity.io",
      image: "",
      price: "0.03ETH",
      currentlySelling: "True",
      address: "0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    },
  ];

  const [data, updateData] = useState(sampleData);
  const [dataFetched, updateFetched] = useState(false);

  async function getAllNFTs() {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

    const transaction = await contract.getAllNFTs();

    const items = await Promise.all(
      transaction.map(async (i) => {
        var tokenURI = await contract.tokenURI(i.tokenId);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };

        return item;
      })
    );

    updateFetched(true);
    updateData(items);
  }

  if (!dataFetched) {
    getAllNFTs();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="flex flex-col items-center mt-20">
        <div className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
          NFT Collection
        </div>
        <div className="flex flex-wrap justify-center gap-8 max-w-screen-xl">
          {data.map((value, index) => (
            <NFTTile data={value} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
