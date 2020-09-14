import "jasmine";
import App from "../../src/index";

describe("App", () => {
  var app: App;

  beforeEach(() => {
    app = new App();
    spyOn(app["server"], "listen").and.returnValue(true);
  });

  it("should construct", () => {
    expect(app).toBeTruthy();
  });

  it("should call setup routes", () => {
    spyOn(app["server"], "use");
    app.startServer();
    expect(app.server.use).toHaveBeenCalledTimes(2);
  });

  it("should call listen", () => {
    app.startServer();
    expect(app.server.listen).toHaveBeenCalled();
  });
});
