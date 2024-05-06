import Navbar from "./Navbar";
import { useLocation, useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage(props) {
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");

  async function getNFTData(tokenId) {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
    let tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);
    meta = meta.data;

    let item = {
      price: meta.price,
      tokenId: tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
    };

    updateData(item);
    updateDataFetched(true);
    updateCurrAddress(addr);
  }

  async function buyNFT(tokenId) {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
      const salePrice = ethers.utils.parseUnits(data.price, "ether");
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
      let transaction = await contract.executeSale(tokenId, { value: salePrice });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      updateMessage("");
    } catch (e) {
      alert("Upload Error: " + e);
    }
  }

  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) getNFTData(tokenId);
  if (typeof data.image == "string") data.image = GetIpfsUrlFromPinata(data.image);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex flex-wrap md:flex-nowrap">
          <div className="w-full md:w-2/5 flex justify-center">
            <img src={data.image} alt={data.name} className="rounded-lg shadow-lg max-w-full" />
          </div>
          <div className="w-full md:w-3/5 mt-6 md:mt-0 md:ml-12">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-4">
              <h2 className="text-3xl font-bold">{data.name}</h2>
              <p className="text-lg">{data.description}</p>
              <p>
                <strong>Price:</strong> {data.price} ETH
              </p>
              <p>
                <strong>Owner:</strong> <span className="text-sm">{data.owner}</span>
              </p>
              <p>
                <strong>Seller:</strong> <span className="text-sm">{data.seller}</span>
              </p>
              {currAddress !== data.owner && currAddress !== data.seller ? (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => buyNFT(tokenId)}
                >
                  Buy this NFT
                </button>
              ) : (
                <div className="text-emerald-500">You are the owner of this NFT</div>
              )}
              <div className="text-center text-green-500 mt-3">{message}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
