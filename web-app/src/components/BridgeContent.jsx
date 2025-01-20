import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallets, useSuiClient } from '@mysten/dapp-kit';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Wallet } from 'lucide-react';

const BridgeContent = () => {
  const [ethConnected, setEthConnected] = useState(false);
  const [ethAddress, setEthAddress] = useState('');
  const [ethBalance, setEthBalance] = useState('0');
  const [suiBalance, setSuiBalance] = useState('0');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [status, setStatus] = useState('');

  const wallets = useWallets();
  const suiClient = useSuiClient();

  useEffect(() => {
    if (ethAddress) updateEthBalance(ethAddress);
    if (selectedWallet && selectedWallet.accounts[0]) {
      updateSuiBalance(selectedWallet.accounts[0].address);
    }
  }, [ethAddress, selectedWallet]);

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
        const balance = await provider.getBalance(address);
        setEthBalance(ethers.formatUnits(balance, 18));
      } catch (error) {
        console.error('Error fetching ETH balance:', error);
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
          await updateSuiBalance(wallet.accounts[0].address);
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
        const coins = await suiClient.getCoins({ owner: address });
        const totalBalance = coins.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n);
        setSuiBalance(ethers.formatUnits(totalBalance, 9));
      } catch (error) {
        console.error('Error fetching SUI balance:', error);
      }
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sui</span>
                  <span className="font-mono text-gray-800">
                    {selectedWallet.accounts[0].address.slice(0, 6)}...
                    {selectedWallet.accounts[0].address.slice(-4)} ({suiBalance} SUI)
                  </span>
                </div>
              )}
            </div>
          )}

          {status && (
            <Alert className="bg-green-50 border border-green-200 rounded-lg">
              <AlertDescription className="text-green-800">{status}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BridgeContent;