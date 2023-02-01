import { ProfileDisplay } from './profile';
import { Transaction } from './transaction';

export interface SearchResults {
  profiles: {
    count: number;
    results: ProfileDisplay[];
  };
  transactions: {
    count: number;
    results: Transaction[];
  };
}
