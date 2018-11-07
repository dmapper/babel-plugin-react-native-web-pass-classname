# babel-plugin-react-native-web-pass-classname

Pass `className` property whenever `style` is passed through.

It's useful when writing reusable components for `react-native-web`
and when using `react-native` libs which were not optimized to also work for `react-native-web`.

## Examples

Input:

```js
const Foo = (props) =>
  <View
    style={[props.titleStyle, props.style]}
  />
```

Output:

```js
const Foo = (props) =>
  <View
    style={[props.titleStyle, props.style]}
    className={props.className}
  />
```

## License

MIT

(c) Decision Mapper - http://decisionmapper.com
