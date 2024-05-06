import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";

export default function SellNFT() {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();

    async function disableButton() {
        const listButton = document.getElementById("list-button");
        listButton.disabled = true;
        listButton.classList.add("opacity-50", "cursor-not-allowed");
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button");
        listButton.disabled = false;
        listButton.classList.remove("opacity-50", "cursor-not-allowed");
    }

    async function OnChangeFile(e) {
        var file = e.target.files[0];
        try {
            disableButton();
            updateMessage("Uploading image.. please don't click anything!");
            const response = await uploadFileToIPFS(file);
            if (response.success === true) {
                enableButton();
                updateMessage("");
                setFileURL(response.pinataURL);
            }
        } catch (e) {
            console.error("Error during file upload", e);
        }
    }

    async function uploadMetadataToIPFS() {
        const { name, description, price } = formParams;
        if (!name || !description || !price || !fileURL) {
            updateMessage("Please fill all the fields!");
            return -1;
        }

        const nftJSON = {
            name,
            description,
            price,
            image: fileURL,
        };

        try {
            const response = await uploadJSONToIPFS(nftJSON);
            if (response.success === true) {
                return response.pinataURL;
            }
        } catch (e) {
            console.error("Error uploading JSON metadata:", e);
        }
    }

    async function listNFT(e) {
        e.preventDefault();
        try {
            const metadataURL = await uploadMetadataToIPFS();
            if (metadataURL === -1) return;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            disableButton();
            updateMessage("Uploading NFT... please wait.");

            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);

            const price = ethers.utils.parseUnits(formParams.price, 'ether');
            let listingPrice = await contract.getListPrice();
            listingPrice = listingPrice.toString();

            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice });
            await transaction.wait();

            alert("Successfully listed your NFT!");
            enableButton();
            updateMessage("");
            updateFormParams({ name: '', description: '', price: '' });
            window.location.replace("/");
        } catch (e) {
            alert("Upload error: " + e.message);
            enableButton();
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="flex flex-col items-center mt-10">
                <form className="w-full max-w-md bg-gray-700 rounded-lg p-6 shadow-lg">
                    <h3 className="text-center text-2xl font-bold mb-6">Upload your NFT to the marketplace</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                        <input 
                            className="w-full p-2 border rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-purple-600" 
                            id="name" 
                            type="text" 
                            placeholder="NFT Name" 
                            onChange={e => updateFormParams({ ...formParams, name: e.target.value })} 
                            value={formParams.name} 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                        <textarea 
                            className="w-full p-2 border rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-purple-600" 
                            id="description" 
                            placeholder="Description" 
                            rows={4} 
                            onChange={e => updateFormParams({ ...formParams, description: e.target.value })} 
                            value={formParams.description} 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                        <input 
                            className="w-full p-2 border rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-purple-600" 
                            id="price" 
                            type="number" 
                            placeholder="Price (in ETH)" 
                            step="0.01" 
                            onChange={e => updateFormParams({ ...formParams, price: e.target.value })} 
                            value={formParams.price} 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                        <input 
                            type="file" 
                            className="w-full p-2 border rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-purple-600" 
                            onChange={OnChangeFile} 
                        />
                    </div>
                    <div className="text-center text-red-500 mb-4">{message}</div>
                    <button 
                        onClick={listNFT} 
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-bold shadow-lg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" 
                        id="list-button"
                    >
                        List NFT
                    </button>
                </form>
            </div>
        </div>
    );
}
