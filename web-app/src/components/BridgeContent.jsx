import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallets, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Wallet } from 'lucide-react';
import { CONTRACT_CONFIG } from '../contracts/contractConfig';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Button } from './ui/button.jsx';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { Input } from './ui/input.jsx';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select.jsx';
import BCS from '../contracts/bcs';

const BridgeContent = () => {
  const [ethConnected, setEthConnected] = useState(false);
  const [ethAddress, setEthAddress] = useState('');
  const [ethBalance, setEthBalance] = useState('0');
  const [suiBalance, setSuiBalance] = useState('0');
  const [suiCoinBalance, setSuiCoinBalance] = useState('0');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectedCoinId, setSelectedCoinId] = useState(''); 
  const [status, setStatus] = useState('');
  const [amount, setAmount] = useState('');
  const [availableCoins, setAvailableCoins] = useState([]);

  const wallets = useWallets();
  const suiClient = useSuiClient();

  useEffect(() => {
    if (ethAddress) updateEthBalance(ethAddress);
    if (selectedWallet && selectedWallet.accounts[0]) {
      updateSuiBalance(selectedWallet.accounts[0].address);
      updateSuiCoinBalance(selectedWallet.accounts[0].address);
      fetchAndSelectCoin(selectedWallet.accounts[0].address);
    }
  }, [ethAddress, selectedWallet]);

  useEffect(() => {
    console.log('Available Coins:', availableCoins);
  }, [availableCoins]);

  const connectEthWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setEthAddress(accounts[0]);
      setEthConnected(true);
      await updateEthBalance(accounts[0]);
      setStatus('Ethereum wallet connected successfully!');
    } catch (error) {
      setStatus('Error connecting Ethereum wallet: ' + error.message);
    }
  };

  const updateEthBalance = async (address) => {
    if (window.ethereum && address) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_CONFIG.ethereum.address,
          CONTRACT_CONFIG.ethereum.abi,
          signer
        );
        const balance = await contract.balanceOf(address);
        setEthBalance(ethers.formatUnits(balance, 18));
      } catch (error) {
        console.error('Error fetching ETH balance:', error);
        setStatus('Error fetching ETH balance: ' + error.message);
      }
    }
  };

  const connectSuiWallet = async (wallet) => {
    try {
      const features = wallet.features['standard:connect'];
      if (features) {
        await features.connect();
        setSelectedWallet(wallet);
        if (wallet.accounts[0]) {
          console.log('Connected Sui Address:', wallet.accounts[0].address);
          await updateSuiBalance(wallet.accounts[0].address);
          await updateSuiCoinBalance(wallet.accounts[0].address);
          await fetchAndSelectCoin(wallet.accounts[0].address);
        }
        setStatus('Sui wallet connected successfully!');
      }
    } catch (error) {
      setStatus('Error connecting Sui wallet: ' + error.message);
    }
  };

  const updateSuiBalance = async (address) => {
    if (selectedWallet && address) {
      try {
        console.log('Fetching IBT coins for address:', address);
        const coins = await suiClient.getCoins({
          owner: address,
          coinType: `${CONTRACT_CONFIG.sui.packageId}::${CONTRACT_CONFIG.sui.module}::IBT`,
        });
  
        console.log('Fetched coins:', coins.data);
  
        const totalBalance = coins.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n);
  
        // Format with 9 decimal places for IBT readability
        const displayBalance = (Number(totalBalance) / 1_000_000_000).toFixed(9);
  
        console.log(`Raw Balance: ${totalBalance.toString()}, Display Balance: ${displayBalance}`);
        setSuiBalance(displayBalance);
      } catch (error) {
        console.error('Error fetching SUI balance:', error);
        setSuiBalance('0');
      }
    }
  }; 

  const updateSuiCoinBalance = async (address) => {
    if (selectedWallet && address) {
      try {
        const coins = await suiClient.getCoins({ owner: address });
        const totalBalance = coins.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n);
        const displayBalance = Number(totalBalance) / 1_000_000_000;
        setSuiCoinBalance(displayBalance.toString());
      } catch (error) {
        console.error('Error fetching SUI coin balance:', error);
        setSuiCoinBalance('0');
      }
    }
  };

  const fetchAndSelectCoin = async (address) => {
    try {
      console.log('Fetching coins for address:', address);
      const coinType = `${CONTRACT_CONFIG.sui.packageId}::${CONTRACT_CONFIG.sui.module}::IBT`;
      console.log('Using coinType:', coinType);
  
      const coins = await suiClient.getCoins({
        owner: address,
        coinType,
      });
  
      console.log('Fetched coins:', coins.data);
  
      if (coins.data.length > 0) {
        setAvailableCoins(coins.data);
        setSelectedCoinId(coins.data[0].coinObjectId);
      } else {
        setStatus('No Coin<IBT> objects available for bridging.');
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
      setStatus('Error fetching coins: ' + error.message);
    }
  };
  
  const validateSelectedCoin = async (coinId, userAddress) => {
    try {
      const coinObject = await suiClient.getObject({
        id: coinId,
        options: { showType: true, showOwner: true },
      });
  
      console.log('Coin Object:', coinObject);
      console.log('Coin Owner:', coinObject.data.owner);
      console.log('User Address:', userAddress);
  
      if (coinObject.error) {
        throw new Error(`Error fetching coin object: ${coinObject.error.message}`);
      }
  
      // Define the expected coin type
      const expectedType = `0x2::coin::Coin<${CONTRACT_CONFIG.sui.packageId}::IBT::IBT>`;
  
      // Check if the object is a Coin<IBT>
      if (coinObject.data.type !== expectedType) {
        throw new Error(`Selected coin is not a valid Coin<IBT>. Expected: ${expectedType}, Got: ${coinObject.data.type}`);
      }
  
      // Extract the owner address from the coinObject.data.owner object
      const coinOwnerAddress = coinObject.data.owner.AddressOwner;
  
      // Check if the coin is owned by the user
      if (coinOwnerAddress !== userAddress) {
        throw new Error(`Selected coin is not owned by the user. Coin Owner: ${coinOwnerAddress}, User Address: ${userAddress}`);
      }
  
      return true;
    } catch (error) {
      console.error('Error validating selected coin:', error);
      throw error;
    }
  };
  
  const handleBridge = async (fromEth) => {
    const bcs = new BCS(); // Initialize BCS
  
    try {
      if (fromEth) {
       // Ethereum to Sui bridging logic

      // Check if Ethereum wallet is connected
      if (!ethConnected || !ethAddress) {
        throw new Error("Ethereum wallet not connected.");
      }

      // Check if the amount is valid
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        throw new Error("Invalid amount.");
      }

      console.log("Bridging from Ethereum to Sui...");
      console.log("Ethereum Address:", ethAddress);
      console.log("Amount to Bridge:", amount);

      // Burn tokens on Ethereum
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.ethereum.address,
        CONTRACT_CONFIG.ethereum.abi,
        signer
      );

      // Convert amount to wei (Ethereum uses 18 decimals)
      const amountWei = ethers.parseUnits(amount, 18);
      console.log("Amount in Wei:", amountWei.toString());

      console.log("Burning tokens on Ethereum...");
      const tx = await contract.burn(amountWei);
      console.log("Ethereum Burn Transaction:", tx);

      await tx.wait();
      console.log("Tokens burned on Ethereum. Now minting on Sui...");
      setStatus("Tokens burned on Ethereum. Now minting on Sui...");

      const txBlock = new Transaction();

      // Set a higher gas budget
      txBlock.setGasBudget(10_000_000_000);
      console.log("Set Gas Budget:", 1_000_000_000);

      // Use the amount directly (no scaling needed for Sui)
      const amountSui = BigInt(amount);
      console.log("Amount for Sui (no decimals):", amountSui.toString());

      // Serialize the amount using BCS
      const serializedAmount = bcs.serializeU64(amountSui.toString());
      console.log("Serialized Amount (u64):", serializedAmount);

      // Use the Sui address of the recipient
      const recipientAddress = selectedWallet.accounts[0].address;
      console.log("Recipient Address (Sui):", recipientAddress);

      // Serialize the Sui address using BCS
      const serializedRecipientAddress = bcs.serializeAddress(recipientAddress);
      console.log("Serialized Recipient Address (address):", serializedRecipientAddress);

      console.log("BridgeAuthId:", CONTRACT_CONFIG.sui.bridgeAuthId);
      console.log("Serialized Amount (u64):", serializedAmount);
      console.log("Serialized Recipient Address (address):", serializedRecipientAddress);

      // Call the mint function
      txBlock.moveCall({
        target: `${CONTRACT_CONFIG.sui.packageId}::${CONTRACT_CONFIG.sui.module}::mint`,
        arguments: [
          txBlock.object(CONTRACT_CONFIG.sui.bridgeAuthId), // BridgeAuth object
          txBlock.pure(serializedAmount, "u64"),           // Amount to mint (u64)
          txBlock.pure(serializedRecipientAddress, "address"), // Recipient address (Sui address)
        ],
      });

      console.log("Sui Transaction Block:", txBlock);

      const features = selectedWallet.features["sui:signAndExecuteTransactionBlock"];
      if (!features) throw new Error("Wallet doesn't support transaction signing");

      console.log("Signing and executing Sui transaction block...");
      const response = await features.signAndExecuteTransactionBlock({
        transactionBlock: txBlock,
      });

      console.log("Full Transaction Response:", JSON.stringify(response, null, 2));

      if (!response || !response.effects) {
        throw new Error("Invalid response from Sui transaction");
      }

      if (response.effects.status && response.effects.status.status === "failure") {
        throw new Error(`Transaction failed: ${response.effects.status.error}`);
      }

      setStatus("Tokens minted on Sui successfully!");
      } else {
        // Sui to Ethereum bridging logic
      if (!selectedWallet || !selectedWallet.accounts[0]) {
        throw new Error("Sui wallet not connected.");
      }

      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        throw new Error("Invalid amount.");
      }

      console.log("Bridging from Sui to Ethereum...");
      console.log("Sui Address:", selectedWallet.accounts[0].address);
      console.log("Amount to Bridge:", amount);

      const userAddress = selectedWallet.accounts[0].address;
      console.log("Validating selected coin...");
      await validateSelectedCoin(selectedCoinId, userAddress);

      const txBlock = new Transaction();

      // Set a higher gas budget
      txBlock.setGasBudget(1_000_000_000);
      console.log("Set Gas Budget:", 1_000_000_000);

      // Serialize the Ethereum address with the length prefix
      const serializedEthAddress = bcs.serializeEthAddress(ethAddress);
      console.log("Ethereum Address Bytes (vector<u8>):", serializedEthAddress);
      console.log("Length:", serializedEthAddress.length); // Should be 21

      // Use the amount directly (no scaling needed for Sui)
      const amountSui = BigInt(amount); // Directly use the amount without scaling
      console.log("Amount for Sui (no decimals):", amountSui.toString());

      // Serialize the amount using BCS
      const serializedAmount = bcs.serializeU64(amountSui);
      console.log("Serialized Amount (u64):", serializedAmount);

      console.log("BridgeAuthId:", CONTRACT_CONFIG.sui.bridgeAuthId);
      console.log("Selected Coin ID:", selectedCoinId);
      console.log("Ethereum Address (bytes):", serializedEthAddress);

      // Corrected burn_and_bridge call with 4 arguments
      txBlock.moveCall({
        target: `${CONTRACT_CONFIG.sui.packageId}::${CONTRACT_CONFIG.sui.module}::burn_and_bridge`,
        arguments: [
          txBlock.object(CONTRACT_CONFIG.sui.bridgeAuthId), // BridgeAuth object
          txBlock.object(selectedCoinId),                  // Coin object to burn
          txBlock.pure(serializedEthAddress, "vector<u8>"), // Serialized Ethereum address
          txBlock.pure(serializedAmount, "u64"),           // Amount to burn (u64)
        ],
      });

      console.log("Sui Transaction Block:", txBlock);

      const features = selectedWallet.features["sui:signAndExecuteTransactionBlock"];
      if (!features) throw new Error("Wallet doesn't support transaction signing");

      console.log("Signing and executing Sui transaction block...");
      const response = await features.signAndExecuteTransactionBlock({
        transactionBlock: txBlock,
      });

      console.log("Full Transaction Response:", JSON.stringify(response, null, 2));

      if (!response || !response.effects) {
        throw new Error("Invalid response from Sui transaction");
      }

      if (response.effects.status && response.effects.status.status === "failure") {
        throw new Error(`Transaction failed: ${response.effects.status.error}`);
      }

      setStatus("Tokens burned on Sui. Now minting on Ethereum...");

      // Mint tokens on Ethereum
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.ethereum.address,
        CONTRACT_CONFIG.ethereum.abi,
        signer
      );

      const amountWei = ethers.parseUnits(amount, 18);
      console.log("Amount in Wei:", amountWei.toString());

      console.log("Minting tokens on Ethereum...");
      const tx = await contract.mint(ethAddress, amountWei);
      console.log("Ethereum Mint Transaction:", tx);

      await tx.wait();
      console.log("Tokens minted on Ethereum successfully!");
      setStatus("Tokens minted on Ethereum successfully!");
      }
    } catch (error) {
      console.error("Error during bridging:", error);
      setStatus("Error during bridging: " + error.message);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-4xl shadow-xl bg-white rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <div className="grid grid-cols-1 gap-4">
            {!ethConnected && (
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all"
                onClick={connectEthWallet}
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Ethereum
              </Button>
            )}
  
            {!selectedWallet && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Available SUI Wallets:</div>
                {wallets.length === 0 ? (
                  <Alert className="bg-gray-50 border border-gray-200 rounded-lg">
                    <AlertDescription>No SUI wallets installed</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-2">
                    {wallets.map((wallet) => (
                      <Button
                        key={wallet.name}
                        variant="outline"
                        className="w-full flex items-center justify-between hover:bg-gray-50 transition-all border-gray-200 rounded-lg py-3"
                        onClick={() => connectSuiWallet(wallet)}
                      >
                        <div className="flex items-center">
                          <img
                            src={wallet.icon}
                            alt={`${wallet.name} icon`}
                            className="w-6 h-6 mr-3"
                          />
                          <span className="text-gray-800 font-medium">{wallet.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">v{wallet.version}</div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
  
          {(ethConnected || selectedWallet) && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {ethConnected && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ethereum</span>
                  <span className="font-mono text-gray-800">
                    {ethAddress.slice(0, 6)}...{ethAddress.slice(-4)} ({ethBalance} ETH)
                  </span>
                </div>
              )}
              {selectedWallet && selectedWallet.accounts[0] && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sui (IBT)</span>
                    <span className="font-mono text-gray-800">
                      {selectedWallet.accounts[0].address.slice(0, 6)}...
                      {selectedWallet.accounts[0].address.slice(-4)} ({suiBalance} IBT)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sui (Gas)</span>
                    <span className="font-mono text-gray-800">
                      {selectedWallet.accounts[0].address.slice(0, 6)}...
                      {selectedWallet.accounts[0].address.slice(-4)} ({suiCoinBalance} SUI)
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
  
          {status && (
            <Alert className="bg-green-50 border border-green-200 rounded-lg">
              <AlertDescription className="text-green-800">{status}</AlertDescription>
            </Alert>
          )}
  
          <div className="space-y-4">
            {selectedWallet && selectedWallet.accounts[0] && (
              <Select value={selectedCoinId} onValueChange={setSelectedCoinId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a coin to bridge" />
                </SelectTrigger>
                <SelectContent>
                  {availableCoins.length > 0 ? (
                    availableCoins.map((coin) => (
                      <SelectItem
                        key={coin.coinObjectId}
                        value={coin.coinObjectId}
                        onClick={(value) => {
                          console.log('Selected Coin ID:', value);
                          setSelectedCoinId(value);
                        }}
                      >
                        {`${Number(coin.balance) / 1_000_000_000} IBT (ID: ${coin.coinObjectId.slice(0, 6)}...)`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No coins available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to bridge"
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all"
                onClick={() => handleBridge(true)}
              >
                Bridge from Ethereum to Sui
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all"
                onClick={() => handleBridge(false)}
              >
                Bridge from Sui to Ethereum
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BridgeContent;