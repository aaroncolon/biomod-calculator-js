import "./styles.scss";

const biomodCalculator = (function() {
  let $form,
    $wasteWaterFlow,
    $bodConcentrationBefore,
    $bodLbsBefore,
    $bodTreatmentSurcharge,
    $dailyBillBefore,
    $monthlyBillBefore,
    $bodRemovalEfficiency,
    $bodConcentrationAfter,
    $bodLbsAfter,
    $dailyBillAfter,
    $monthlyBillAfter,
    $totalSavings,
    $totalSavingsPercent;

  const state = {
    wasteWaterFlow         : 50000,
    bodConcentrationBefore : 2500,
    bodLbsBefore           : 0,
    bodTreatmentSurcharge  : 2,
    dailyBillBefore        : 0,
    monthlyBillBefore      : 0,
    bodRemovalEfficiency   : 85,
    bodConcentrationAfter  : 0,
    bodLbsAfter            : 0,
    dailyBillAfter         : 0,
    monthlyBillAfter       : 0,
    totalSavings           : 0,
    totalSavingsPercent    : 0
  };

  function init() {
    cacheDom();
    bindEvents();
    calcValues();
    render();
  }

  function cacheDom() {
    $form                   = document.getElementById('form-biomod');
    $wasteWaterFlow         = $form.querySelector('#waste-water-flow');
    $bodConcentrationBefore = $form.querySelector('#bod-concentration-before');
    $bodLbsBefore           = $form.querySelector('#bod-lbs-before');
    $bodTreatmentSurcharge  = $form.querySelector('#bod-treatment-surcharge');
    $dailyBillBefore        = $form.querySelector('#daily-bill-before');
    $monthlyBillBefore      = $form.querySelector('#monthly-bill-before');
    $bodRemovalEfficiency   = $form.querySelector('#bod-removal-efficiency');
    $bodConcentrationAfter  = $form.querySelector('#bod-concentration-after');
    $bodLbsAfter            = $form.querySelector('#bod-lbs-after');
    $dailyBillAfter         = $form.querySelector('#daily-bill-after');
    $monthlyBillAfter       = $form.querySelector('#monthly-bill-after');
    $totalSavings           = $form.querySelector('#total-savings');
    $totalSavingsPercent    = $form.querySelector('#total-savings-percent');
  }

  function bindEvents() {
    $form.addEventListener('submit', handleSubmit);
    $wasteWaterFlow.addEventListener('input', handleInput);
    $bodConcentrationBefore.addEventListener('input', handleInput);
    $bodTreatmentSurcharge.addEventListener('input', handleInput);
    $bodRemovalEfficiency.addEventListener('input', handleInput);
  }

  function render() {
    const bodLbsBefore          = Math.round(state.bodLbsBefore);
    const bodTreatmentSurcharge = Math.round(state.bodTreatmentSurcharge);
    const dailyBillBefore       = roundHundredths(state.dailyBillBefore);
    const monthlyBillBefore     = roundHundredths(state.monthlyBillBefore);
    const bodConcentrationAfter = convertPercentForDisplay(state.bodConcentrationAfter);
    const bodLbsAfter           = Math.round(state.bodLbsAfter);
    const dailyBillAfter        = roundHundredths(state.dailyBillAfter);
    const monthlyBillAfter      = roundHundredths(state.monthlyBillAfter);
    const totalSavings          = Math.round(state.totalSavings);
    const totalSavingsPercent   = convertPercentForDisplay(state.totalSavingsPercent);

    $bodLbsBefore.value          = bodLbsBefore;
    $dailyBillBefore.value       = dailyBillBefore;
    $monthlyBillBefore.value     = monthlyBillBefore;
    $bodConcentrationAfter.value = bodConcentrationAfter;
    $bodLbsAfter.value           = bodLbsAfter;
    $dailyBillAfter.value        = dailyBillAfter;
    $monthlyBillAfter.value      = monthlyBillAfter;
    $totalSavings.value          = totalSavings;
    $totalSavingsPercent.value   = totalSavingsPercent;
  }

  function handleSubmit(e) {
    e.preventDefault();
    calcValues();
    render();
  }

  function handleInput(e) {
    e.preventDefault();

    const id  = e.currentTarget.id;
    const val = e.currentTarget.value;

    switch (id) {
      case 'waste-water-flow':
        setState({
          wasteWaterFlow: val
        });
        break;
      case 'bod-concentration-before':
        setState({
          bodConcentrationBefore: val
        });
        break;
      case 'bod-treatment-surcharge':
        setState({
          bodTreatmentSurcharge: val
        });
        break;
      case 'bod-removal-efficiency':
        setState({
          bodRemovalEfficiency: val
        });
      default:
        break;
    }

    calcValues();
    render();
  }

  function setState(_state) {
    for (const prop in _state) {
      if (_state.hasOwnProperty(prop)) {
        state[prop] = _state[prop]
      } 
    }
  }

  function calcValues() {
    const bodLbsBefore          = calcBodLbsBefore();
    const dailyBillBefore       = calcDailyBillBefore(bodLbsBefore);
    const monthlyBillBefore     = calcMonthlyBillBefore(dailyBillBefore);
    const bodConcentrationAfter = calcReducedBodConcentration();
    const bodLbsAfter           = calcBodLbsAfter(bodConcentrationAfter);
    const dailyBillAfter        = calcDailyBillAfter(bodLbsAfter);
    const monthlyBillAfter      = calcMonthlyBillAfter(dailyBillAfter);
    const totalSavings          = calcTotalSavings(monthlyBillBefore, monthlyBillAfter);
    const totalSavingsPercent   = calcTotalSavingsPercent(monthlyBillBefore, totalSavings);

    setState({
      bodLbsBefore,
      dailyBillBefore,
      monthlyBillBefore,
      bodConcentrationAfter,
      bodLbsAfter,
      dailyBillAfter,
      monthlyBillAfter,
      totalSavings,
      totalSavingsPercent
    });
  };

  function calcBodLbsBefore() {
    return state.bodConcentrationBefore * (state.wasteWaterFlow / 1000000) * 8.34;
  }

  function calcDailyBillBefore(bodLbsBefore) {
    return bodLbsBefore * state.bodTreatmentSurcharge;
  }

  function calcMonthlyBillBefore(dailyBillBefore) {
    return dailyBillBefore * 30;
  }

  function calcReducedBodConcentration() {
    return state.bodConcentrationBefore - (state.bodConcentrationBefore * convertPercentForCalc(state.bodRemovalEfficiency));
  }

  function calcBodLbsAfter(bodConcentrationAfter) {
    return bodConcentrationAfter * (state.wasteWaterFlow / 1000000) * 8.34;
  }

  function calcDailyBillAfter(bodLbsAfter) {
    return bodLbsAfter * state.bodTreatmentSurcharge;
  }

  function calcMonthlyBillAfter(dailyBillAfter) {
    return dailyBillAfter * 30;
  }

  function calcTotalSavings(monthlyBillBefore, monthlyBillAfter) {
    return monthlyBillBefore - monthlyBillAfter - 22549;
  }

  function calcTotalSavingsPercent(monthlyBillBefore, totalSavings) {
    return (totalSavings / monthlyBillBefore);
  }

  function convertPercentForCalc(number) {
    return number / 100;
  }

  function convertPercentForDisplay(number) {
    const percent = Math.round(number * 100);
    return String(percent) + '%';
  }

  function roundHundredths(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  return {
    init: init
  }

})()

biomodCalculator.init()
