
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'PolyChrome'});
};


exports.drawing = function(req, res){
  res.render('drawing', {});
};


exports.choropleth = function(req, res){
  res.render('choropleth', {});
};