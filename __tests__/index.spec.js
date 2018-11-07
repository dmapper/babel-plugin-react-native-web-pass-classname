import pluginTester from 'babel-plugin-tester'
import plugin from '../index'

pluginTester({
  plugin,
  pluginName: 'babel-plugin-react-native-pass-classname',
  snapshot: true,
  pluginOptions: {
    limitOnePerFile: true,
    complexCases: true
  },
  babelOptions: {
    babelrc: true,
    filename: 'index.js'
  },
  tests: [
    {
      title: '[fn] plain',
      code: `
        const Foo = ({style}) => <View style={style} />
      `
    },
    {
      title: '[fn classic] plain',
      code: `
        const Foo = function ({style}) { return <View style={style} /> }
      `
    },
    {
      title: '[fn classic w/ name] plain',
      code: `
        function Foo ({style}) { return <View style={style} /> }
      `
    },
    {
      title: '[fn] from props',
      code: `
        const Foo = (props) => <View style={props.style} />
      `
    },
    {
      title: '[fn] plain in array',
      code: `
        const Foo = ({style, titleStyle, ...props}) => <View style={[titleStyle, style]} {...props} />
      `
    },
    {
      title: '[fn] from props in array',
      code: `
        const Foo = ({titleStyle, ...props}) => <View style={[titleStyle, props.style]} {...props} />
      `
    },
    {
      title: '[class] plain',
      code: `
        class Foo {
          render () {
            let {style} = this.props
            return (
              <View style={style} />
            )
          }
        }
      `
    },
    {
      title: '[class] this.props.style',
      code: `
        class Foo {
          render () {
            return (
              <View style={this.props.style} />
            )
          }
        }
      `
    },
    {
      title: '[class] array this.props.style',
      code: `
        class Foo {
          render () {
            return (
              <View style={[this.props.titleStyle, this.props.style]} />
            )
          }
        }
      `
    },
    {
      title: '[fn] existing className as string',
      code: `
        const Foo = ({style}) => <View style={style} className='foobar' />
      `
    },
    {
      title: '[fn] existing className as expression',
      code: `
        const Foo = ({style}) => <View style={style} className={_getClassName('foobar')} />
      `
    }
  ]
})
