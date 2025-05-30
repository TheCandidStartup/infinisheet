import { ok, err } from './Result'

describe('Result', () => {
  it('ok', () => {
    const data = ok<number,string>(42);
    expect(data.isOk()).toEqual(true);
    expect(data._unsafeUnwrap()).toEqual(42);
  })

  it('err', () => {
    const data = err<number,string>("bad");
    expect(data.isOk()).toEqual(false);
    expect(data._unsafeUnwrapErr()).toEqual("bad");
  })
})
