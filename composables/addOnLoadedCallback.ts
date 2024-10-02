const isLoading = useState<boolean>('isLoading')
const onLoadedCallbacks = useState<Function[]>('onLoadedCallbacks')

export default function(cb: Function) {
  if (isLoading.value) {
    onLoadedCallbacks.value.push(cb);
  } else {
    // Already loaded, invoke callback immediately
    cb();
  }
}
