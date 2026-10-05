const panel=mountRangeLens(document.querySelector('#demo'),{demo:true,onClose:()=>location.reload()});
const chart=document.querySelector('#demo-chart-timeframe');chart.onchange=()=>panel.setChartInterval(chart.value==='unknown'?null:+chart.value,'Demo chart timeframe not detected');panel.setChartInterval(+chart.value);
