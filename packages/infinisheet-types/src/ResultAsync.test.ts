import { okAsync, errAsync } from './ResultAsync'

describe('ResultAsync', () => {
  it('await okAsync', async () => {
    const data = await okAsync<number,string>(42);
    expect(data.isOk()).toEqual(true);
    expect(data._unsafeUnwrap()).toEqual(42);
  })

  it('await errAsync', async () => {
    const data = await errAsync<number,string>("bad");
    expect(data.isOk()).toEqual(false);
    expect(data._unsafeUnwrapErr()).toEqual("bad");
  })
})
