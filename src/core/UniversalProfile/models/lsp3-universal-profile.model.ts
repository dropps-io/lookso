import { type Link, type MetadataAsset, type MetadataImage } from './metadata-objects';

export interface LSP3UniversalProfile {
  name: string;
  description: string;
  links: Link[];
  tags: string[];
  profileImage: MetadataImage[];
  backgroundImage: MetadataImage[];
  avatar?: MetadataAsset;
}

export function initialUniversalProfile(): LSP3UniversalProfile {
  return {
    name: '',
    description: '',
    links: [],
    tags: [],
    profileImage: [],
    backgroundImage: [],
  };
}
