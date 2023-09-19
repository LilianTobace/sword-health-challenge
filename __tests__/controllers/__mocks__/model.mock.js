module.exports.mockRequest = (body, params) => ({
  body, params,
});

module.exports.mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

module.exports.mockedModel = {
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  destroy: jest.fn(),
  validCredentials: jest.fn(),
  generateToken: jest.fn(() => '123'),
};
