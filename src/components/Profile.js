import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import NFTTile from "./NFTTile";

export default function Profile() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const [address, updateAddress] = useState("0x");
  const [totalPrice, updateTotalPrice] = useState("0");

  async function getNFTData() {
    const ethers = require("ethers");
    let sumPrice = 0;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (!accounts || accounts.length === 0) {
      updateFetched(true);
      return;
    }
    const signer = provider.getSigner();
    const addr = accounts[0];
    const code = await provider.getCode(MarketplaceJSON.address);
    if (!code || code === "0x") {
      updateFetched(true);
      return;
    }
    const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

    const transaction = await contract.getMyNFTs();
    const items = await Promise.all(
      transaction.map(async (i) => {
        let tokenURI = await contract.tokenURI(i.tokenId);
        // normalize to gateway if needed
        try {
          const res = await axios.get(tokenURI);
          if (!res || !res.data) return null;
          var meta = res.data;
        } catch (_) {
          return null;
        }

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
        sumPrice += Number(price);
        return item;
      })
    );

    updateData(items.filter(Boolean));
    updateFetched(true);
    updateAddress(addr);
    updateTotalPrice(sumPrice.toPrecision(3));
  }

  if (!dataFetched) {
    getNFTData();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center">
            <h3 className="text-xl font-bold">No. of NFTs</h3>
            <p className="text-xl">{data.length}</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">Total Value</h3>
            <p className="text-2xl">{totalPrice} ETH</p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Your NFTs</h2>
          <div className="flex justify-center flex-wrap gap-8 max-w-screen-xl mx-auto">
            {data.map((value, index) => (
              <NFTTile data={value} key={index} />
            ))}
          </div>
          <div className="mt-10 text-xl text-center">
            {data.length === 0 ? "Oops, No NFT data to display. Are you logged in?" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
