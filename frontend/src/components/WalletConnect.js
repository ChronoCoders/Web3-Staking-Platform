import React from 'react';

function WalletConnect({ account, connectWallet, isConnecting }) {
  return (
    <div className="card">
      <div className="card-header">Wallet Connection</div>
      <div className="card-body">
        {!account ? (
          <div className="d-grid">
            <button 
              className="btn btn-primary" 
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div>
            <h5>Connected Account</h5>
            <div className="wallet-address">
              {account}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletConnect;