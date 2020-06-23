describe('Testing handling of KEY_FILE', () => {
  it('being undefined, expect to be set to key.rs', async function () {
    delete process.env.KEY_FILE;
    require('../src/auth');
    expect(process.env.KEY_FILE).toEqual('key.rs');
    process.env.KEY_FILE = 'key.rs';
  });
  it('being set to an user defined value, expect not to be set to key.rs', async function () {
    process.env.KEY_FILE = 'asdfasdf.rs';
    require('../src/auth');
    expect(process.env.KEY_FILE).not.toEqual('key.rs');
    process.env.KEY_FILE = 'key.rs';
  });
});
