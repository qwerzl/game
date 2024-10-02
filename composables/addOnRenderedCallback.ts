const onRenderedCallbacks = useState<Function[]>('onRenderedCallbacks')

export default function(cb: Function) {
  onRenderedCallbacks.value.push(cb);
}
