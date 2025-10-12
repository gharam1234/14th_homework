import { FetchBoardQuery } from '@/gql/graphql';

export interface IMyvariables {
    boardId: string
    password: string
    
  
    updateBoardInput: {
      title?: string
      contents?: string
      youtubeUrl?: string
      boardAddress?: {
        zipcode?: string
        address?: string
        addressDetail?: string
      }
      images?: string[]
    }

  }
  
export interface IBoardWriteProps {
    isEdit : boolean
    data? : FetchBoardQuery
}

export interface Idata {
  zonecode: string; 
  address: string; 
  addressDetail: string; 
  addressEnglish?: string; 
  addressType?: 'R' | 'J'; 
  bname?: string; 
  buildingName?: string; 
  extraAddress?: string;
}