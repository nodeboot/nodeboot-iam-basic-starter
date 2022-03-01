const escape = require('escape-html');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const Oauth2SpecService = require('../services/logic/Oauth2SpecService.js');

function Oauth2SpecRoutes(oauth2SpecService, expressInstance) {

  this.oauth2SpecService = oauth2SpecService;
  this.expressInstance = expressInstance;

  this.configure = () => {
    //TODO: detect if body-parser urlencoded/json are configured
    return new Promise((resolve, reject) => {
      this.expressInstance.post("/oauth2/token", tokenRoute);
      console.log(`registered route: Oauth2SpecRoutes.tokenRoute endpoint:/oauth2/token method:post`);
      resolve()
    })
  }

  tokenRoute = async (req, res) => {

    if (!req.is('application/x-www-form-urlencoded')) {
      res.status(400);
      return res.json({
        code: 400,
        message: "unsuported content type"
      });
    }
    
    try {
      var tokenResponse = await this.oauth2SpecService.generateToken(req.body);
      res.status(tokenResponse.code);
      return res.json(tokenResponse);
    } catch (e) {
      console.log(e);
      res.status(500);
      return res.json({
        code: 500,
        message: "internal error"
      });
    }
  }
}

module.exports = Oauth2SpecRoutes;
