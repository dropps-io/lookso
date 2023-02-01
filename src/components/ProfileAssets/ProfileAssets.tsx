import React, { FC, useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

import styles from './ProfileAssets.module.scss';
import { fetchProfileAssets } from '../../core/api/api';
import { AssetWithBalance } from '../../models/asset';
import { SOL_STANDARD } from '../../models/enums/sol-standard';
import { TOKEN_ID_TYPE } from '../../models/enums/token-id-type';
import defaultAssetImage from '../../assets/images/default-token.png';

interface ProfileAssetsProps {
  address: string;
}

const ProfileAssets: FC<ProfileAssetsProps> = props => {
  const [assets, setAssets] = useState<Omit<AssetWithBalance, 'tokens'>[]>([]);
  const [loading, setLoading] = useState(false);

  const getDigitsDisplay = (
    address: string,
    tokenIdType: TOKEN_ID_TYPE,
    standard: SOL_STANDARD,
    tokenId: string,
    decodedTokenId?: string
  ): string => {
    if (standard === SOL_STANDARD.ERC721 && tokenId) return tokenId;
    if (!decodedTokenId) return address.slice(2, 6);
    switch (tokenIdType) {
      case TOKEN_ID_TYPE.unknown:
        return address.slice(2, 6);
      case TOKEN_ID_TYPE.uint256:
        return decodedTokenId;
      default:
        return tokenId.slice(2, 8);
    }
  };

  const formatAssetsForDisplay = (
    assets: AssetWithBalance[]
  ): Omit<AssetWithBalance, 'tokens'>[] => {
    const displayAssets: Omit<AssetWithBalance, 'tokens'>[] = [];
    for (const asset of assets) {
      if (!asset.tokens || (asset.tokens.length === 0 && asset.balance)) {
        displayAssets.push(asset);
      } else if (asset.tokens) {
        for (const token of asset.tokens) {
          displayAssets.push({
            name:
              token.name ||
              `${asset.name || 'unnamed'}#${getDigitsDisplay(
                asset.address,
                asset.tokenIdType || TOKEN_ID_TYPE.unknown,
                asset.type,
                token.tokenId,
                token.decodedTokenId
              )}`,
            image: token.image || asset.image,
            address: asset.address,
            type: asset.type,
          });
        }
      }
    }
    return displayAssets;
  };

  useEffect(() => {
    let fetch = fetchProfileAssets(props.address);

    const fetchAssets = async () => {
      setLoading(true);
      setAssets([]);
      const assets = (await fetch.promise).data;
      const displayAssets = formatAssetsForDisplay(assets);
      setAssets(displayAssets);
      setLoading(false);
    };
    fetchAssets().then();

    return () => {
      if (fetch) fetch.cancel();
    };
  }, [props.address]);

  return (
    <div className={styles.ProfileAssets} data-testid="ProfileAssets">
      {assets.length > 0 ? (
        <div className={styles.AssetsGrid}>
          {assets.map((asset, index) => (
            <div
              key={index}
              className={styles.Asset}
              style={{ backgroundImage: `url(${asset.image || defaultAssetImage.src})` }}
            >
              <div
                className={styles.Blurry}
                style={{ backgroundImage: `url(${asset.image || defaultAssetImage.src})` }}
              />
              <div className={styles.Overlay}>
                <div className={styles.AssetInfo}>
                  <div className={styles.Upper}>
                    <span className={styles.AssetName}>{asset.name}</span>
                    <span
                      className={`${styles.AssetType} ${
                        [SOL_STANDARD.LSP8, SOL_STANDARD.LSP7].includes(asset.type) &&
                        styles.AssetLukso
                      }`}
                    >
                      {asset.type}
                    </span>
                  </div>
                  {asset.balance && <span>Balance: {asset.balance}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>No assets</p>
      )}
      {loading && (
        <div className={styles.Loading}>
          <CircularProgress size={60} />
        </div>
      )}
    </div>
  );
};

export default ProfileAssets;
