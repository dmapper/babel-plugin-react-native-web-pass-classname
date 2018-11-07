var STYLE_PLAIN = 'PLAIN'
var STYLE_PROPS = 'PROPS'
var STYLE_THIS = 'THIS'

var ARRAY_PREFIX = 'ARRAY_'
function arrayStyleType (styleType) {
  return ARRAY_PREFIX + styleType
}

module.exports = function (babel) {
  var className = null
  var style = null
  var uniqueKey = null
  var t = babel.types

  function styleInSingleExpression (exp) {
    // style
    if (t.isIdentifier(exp)) {
      return exp.name === 'style' ? STYLE_PLAIN : false
    }

    if (t.isMemberExpression(exp)) {

      // this.props.style
      if (t.isMemberExpression(exp.object)) {
        var thisProps = exp.object
        return (
          t.isThisExpression(thisProps.object) &&
          t.isIdentifier(thisProps.property) && thisProps.property.name === 'props' &&
          t.isIdentifier(exp.property) && exp.property.name === 'style'
        ) ? STYLE_THIS : false

      // props.style
      } else {
        return (
          t.isIdentifier(exp.object) && exp.object.name === 'props' &&
          t.isIdentifier(exp.property) && exp.property.name === 'style'
        ) ? STYLE_PROPS : false
      }
    }
  }

  function doesPassStyle (path) {
    // console.log(expression)
    if (style.parentPath.node !== path.node) return false
    // console.log('style', style.node.value.expression)
    var exp = style.node.value.expression

    // 1) Either the style is passed through with 'style' or 'props.style'
    var plainStyle = styleInSingleExpression(exp)
    if (plainStyle) return plainStyle

    // false means that we should halt and don't check any other variants
    if (plainStyle === false) return false

    // 2) Or an array with one of the elements -- an identifier named 'style'
    if (t.isArrayExpression(exp)) {
      var styleType
      return exp.elements.some(function (element) {
        styleType = styleInSingleExpression(element)
        return styleType
      }) ? arrayStyleType(styleType) : false
    }
  }

  function isFunction (node) {
    return t.isFunctionDeclaration(node) || t.isFunctionExpression(node) || t.isArrowFunctionExpression(node)
  }

  return {
    post () {
    },
    visitor: {
      JSXOpeningElement: {
        exit (path) {
          if (
            style !== null &&
            t.isJSXExpressionContainer(style.node.value)
          ) {
            var styleType = doesPassStyle(path)
            if (styleType) {

              // Find the closest function declaration
              var functionPath = path.parentPath
              while (functionPath && !isFunction(functionPath.node)) functionPath = functionPath.parentPath
              var propsParam = functionPath && functionPath.node && functionPath.node.params && functionPath.node.params[0]
              var expression
              if (propsParam && t.isIdentifier(propsParam)) {
                // Probably functional expression, take from first argument
                expression = t.logicalExpression('&&',
                  propsParam,
                  t.memberExpression(
                    propsParam,
                    t.identifier('className')
                  )
                )
              } else {
                // Probably part of render () function, take from this
                expression = t.logicalExpression('&&',
                  t.thisExpression(),
                  t.logicalExpression('&&',
                    t.memberExpression(t.thisExpression(), t.identifier('props')),
                    t.memberExpression(t.memberExpression(t.thisExpression(), t.identifier('props')), t.identifier('className'))
                  )
                )
              }

              // Create a new expression if doesn't exist
              if (className === null) {
                path.node.attributes.push(t.JSXAttribute(
                  t.JSXIdentifier('className'),
                  t.JSXExpressionContainer(expression)
                ))

              // Or add into an existing one as `(x || '') + ' ' + className`
              } else {
                var existingExpression

                if (t.isStringLiteral(className.node.value)) {
                  existingExpression = className.node.value
                } else if (t.isJSXExpressionContainer(className.node.value)) {
                  existingExpression = className.node.value.expression
                }

                var safeExpression = t.logicalExpression('||', existingExpression, t.stringLiteral(''))
                var plusSpace = t.binaryExpression('+', safeExpression, t.stringLiteral(' '))
                var plusClassName = t.binaryExpression('+', plusSpace, expression)

                className.node.value = plusClassName
              }
            }
          }

          className = null
          style = null
          uniqueKey = null
        }
      },
      JSXAttribute: function (path) {
        var name = path.node.name.name
        if (name === 'className') {
          className = path
        } else if (name === 'style') {
          style = path
        } else if (name === 'uniqueKey') {
          uniqueKey = true
        }
      }
    }
  }
}
