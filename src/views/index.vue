<template>
  <div>
    <template v-if="superAdminFlag === 1">
      <OverViewComponent />
    </template>
    <template v-else>
      <DashaedComponent />
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import OverViewComponent from '@/views/record/overview/index';
import DashaedComponent from '@/views/record/dashaed/index';

export default {
  name: 'Index',
  components: {
    OverViewComponent,
    DashaedComponent
  },
  computed: {
    ...mapGetters(['superAdminFlag']),
  },
  created() {
  },
};
</script>
