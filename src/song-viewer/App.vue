<template>
  <div>
    <div id="canvas" ref="canvas"></div>
  </div>
</template>
<script lang='ts'>
import * as Vex from 'vexflow';
import Vue from 'vue';

const VF = Vex.Flow;

export default Vue.extend({
  data() {
    return {};
  },
  mounted(): void {
    const renderer = new VF.Renderer(this.$refs.canvas as HTMLElement, VF.Renderer.Backends.SVG);
    renderer.resize(500, 500);
    const context = renderer.getContext();

    const stave = new VF.Stave(10, 40, 400);
    stave.addClef('treble').addTimeSignature('4/4');
    stave.setContext(context).draw();
  },
});
</script>
<style lang="scss">
#test {
  color: red;
}
</style>
