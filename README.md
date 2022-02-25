# nodeboot-database-starter

![](./coverage/lines.svg) ![](./coverage/statements.svg) ![](./coverage/branches.svg) ![](./coverage/functions.svg)

Library used in [nodeboot-rest-starter](https://github.com/nodeboot/nodeboot-rest-starter) which allows us to inject a ready to use **knex** instance

## usage

[nodeboot-rest-starter](https://github.com/nodeboot/nodeboot-rest-starter) use it in this way:

```
if (require.resolve(rootNodeModulesLocation+'/nodeboot-database-starter')) {
   console.log("nodeboot-database-starter was detected. Configuring...");
   const DatabaseStarter = require(rootNodeModulesLocation+"/nodeboot-database-starter");
   var databaseStarter = new DatabaseStarter();
   var dbSession = await databaseStarter.autoConfigure(rootNodeModulesLocation);

   if (typeof dbSession !== 'undefined') {
     console.log("dbSession is ready");
     this.instancedDependecies["dbSession"] = dbSession || {};
   }
}
```

Basically if the developer add **nodeboot-database-starter** to its package.json, **nodeboot-rest-starter** will detect it and starts the auto configuration

## Road map

- [ ] add more databases like postgress, sqlserver, oracle
- [ ] publish to npm repository: https://www.npmjs.com/package/repository

## Inspiration

- [spring-boot-starter-data-jpa](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)

## Contributors

<table>
  <tbody>
    <td style="text-align: center;" >
      <img src="https://avatars0.githubusercontent.com/u/3322836?s=460&v=4" width="100px;"/>
      <br />
      <label><a href="http://jrichardsz.github.io/">JRichardsz</a></label>
      <br />
    </td>    
  </tbody>
</table>


var express = require('express');
var app = express();

app.use(function(req, res, next){
  console.log("app.use");
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      console.log(r.route.path)
    }
  })
  next();
})

function middleware2(permiso){

  return function middleware(req, res, next){
    console.log("middleware");
    console.log(req.route);
    next();
  }

}

function middleware(req, res, next){
  console.log("middleware");
  console.log(req.route);
  next();
}

app.get('/route1', middleware2("asdasd:asdasd"), function(req, res) {
  res.type('text/plain');
  res.send('Hell , its about time!!');
});

app.get('/user/:id', middleware, function(req, res) {
  res.type('text/plain');
  res.send('Hell , its about time!!');
});


app.listen(process.env.PORT || 8080);


node_modules/express/lib/router/layer.js



var express = require('express');
var app = express();

app.use(function(req, res, next){
  console.log("app.use");
  console.log(app._router);
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      console.log(r.route)
    }
  })
  next();
})

function middlewareClass(permiso){
  return function middleware(req, res, next){
    console.log("middleware");
    console.log(req.route);
    next();
  }
}

app.get('/route1', middlewareClass("route1:scope1"), function(req, res) {
  res.type('text/plain');
  res.send('Hell , its about time: route1');
});

app.get('/user/:id', middlewareClass("route2:scope2"), function(req, res) {
  res.type('text/plain');
  res.send('Hell , its about time: user');
});


app.listen(process.env.PORT || 8080);
