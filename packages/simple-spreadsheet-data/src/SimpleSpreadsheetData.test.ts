import { SimpleSpreadsheetData } from './SimpleSpreadsheetData'
import { spreadsheetDataInterfaceTests } from '../../infinisheet-types/src/SpreadsheetData.interface-test'

describe('SimpleSpreadsheetData', () => {
  spreadsheetDataInterfaceTests(() => new SimpleSpreadsheetData);
})
