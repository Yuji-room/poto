<template>
    <v-dialog v-model="internalValue" :max-width="maxWidth">
      <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>
          <slot></slot>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-for="(action, index) in actions" :key="index" :color="action.color" text @click="action.handler">
            {{ action.text }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  export default {
    props: {
      modelValue: Boolean,
      title: String,
      maxWidth: {
        type: String,
        default: "600px",
      },
      actions: {
        type: Array,
        default: () => [],
      },
    },
    computed: {
      internalValue: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit("update:modelValue", value);
        },
      },
    },
  };
  </script>
  