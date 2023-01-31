import { type FeedDisplayParam } from './PostBox';
import { shortenAddress } from '../../core/utils/address-formating';

export function getTextPostContent(text: string, params: Record<string, FeedDisplayParam>) {
  return text
    .split(/{([^}]+)}/)
    .map(entry => (params[entry] ? paramContent(params[entry]) : entry))
    .join(' ');
}

function paramContent(param: FeedDisplayParam) {
  if (param.type === 'address') {
    if (param.additionalProperties.interfaceCode) {
      const code: string = param.additionalProperties.interfaceCode;
      if (code === 'LSP0') {
        return `@${param.display ? param.display : 'unnamed'}#${param.value.slice(2, 6)}`;
      } else if (code === 'LSP6') {
        return `🔑 ${shortenAddress(param.value, 3)}`;
      } else if (
        code === 'LSP7' ||
        code === 'LSP8' ||
        code === 'ERC20' ||
        code === 'ERC721' ||
        code === 'ERC777' ||
        code === 'ERC1155'
      ) {
        return `${code} ${param.display ? param.display : 'unnamed'}#${param.value.slice(2, 6)}`;
      } else {
        return param.value.slice(2, 6);
      }
    } else {
      return param.display ? param.display : shortenAddress(param.value, 3);
    }
  } else if (param.type === 'bytes32' || param.type === 'bytes') {
    return shortenAddress(param.value, 5);
  } else {
    return param.display ? param.display : shortenAddress(param.value, 3);
  }
}
