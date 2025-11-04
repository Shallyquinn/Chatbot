/**
 * GENERATED HANDLER METHODS
 * Categories: 9
 * Add these to FPMChangeProvider class
 */


  /**
   * general_question messages handler
   * Generated from flowchart - 8 messages
   */
  private async handleGeneralQuestionMessages(context: string): Promise<void> {
    // Message selection based on context
    const messageMap: Record<string, any> = {
      context_0: MSG_GENERAL_QUESTION_0,
      context_1: MSG_GENERAL_QUESTION_2,
      context_2: MSG_GENERAL_QUESTION_15,
      context_3: MSG_GENERAL_QUESTION_25,
      context_4: MSG_GENERAL_QUESTION_27,
      context_5: MSG_GENERAL_QUESTION_31,
      context_6: MSG_GENERAL_QUESTION_37,
      context_7: MSG_GENERAL_QUESTION_48,
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: 'general_question'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: 'general_question',
      current_fpm_method: this.state.currentFPMMethod
    });
  }


  /**
   * instruction messages handler
   * Generated from flowchart - 2 messages
   */
  private async handleInstructionMessages(context: string): Promise<void> {
    // Message selection based on context
    const messageMap: Record<string, any> = {
      context_0: MSG_INSTRUCTION_1,
      context_1: MSG_INSTRUCTION_23,
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: 'instruction'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: 'instruction',
      current_fpm_method: this.state.currentFPMMethod
    });
  }


  /**
   * general_info messages handler
   * Generated from flowchart - 23 messages
   */
  private async handleGeneralInfoMessages(context: string): Promise<void> {
    // Message selection based on context
    const messageMap: Record<string, any> = {
      context_0: MSG_GENERAL_INFO_3,
      context_1: MSG_GENERAL_INFO_4,
      context_2: MSG_GENERAL_INFO_5,
      context_3: MSG_GENERAL_INFO_6,
      context_4: MSG_GENERAL_INFO_9,
      context_5: MSG_GENERAL_INFO_11,
      context_6: MSG_GENERAL_INFO_12,
      context_7: MSG_GENERAL_INFO_16,
      context_8: MSG_GENERAL_INFO_17,
      context_9: MSG_GENERAL_INFO_19,
      context_10: MSG_GENERAL_INFO_20,
      context_11: MSG_GENERAL_INFO_26,
      context_12: MSG_GENERAL_INFO_28,
      context_13: MSG_GENERAL_INFO_29,
      context_14: MSG_GENERAL_INFO_30,
      context_15: MSG_GENERAL_INFO_32,
      context_16: MSG_GENERAL_INFO_34,
      context_17: MSG_GENERAL_INFO_36,
      context_18: MSG_GENERAL_INFO_39,
      context_19: MSG_GENERAL_INFO_41,
      context_20: MSG_GENERAL_INFO_43,
      context_21: MSG_GENERAL_INFO_47,
      context_22: MSG_GENERAL_INFO_49,
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: 'general_info'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: 'general_info',
      current_fpm_method: this.state.currentFPMMethod
    });
  }


  /**
   * method_info messages handler
   * Generated from flowchart - 2 messages
   */
  private async handleMethodInfoMessages(context: string): Promise<void> {
    // Message selection based on context
    const messageMap: Record<string, any> = {
      context_0: MSG_METHOD_INFO_7,
      context_1: MSG_METHOD_INFO_8,
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: 'method_info'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: 'method_info',
      current_fpm_method: this.state.currentFPMMethod
    });
  }


  /**
   * eligibility_info messages handler
   * Generated from flowchart - 2 messages
   */
  private async handleEligibilityInfoMessages(context: string): Promise<void> {
    // Message selection based on context
    const messageMap: Record<string, any> = {
      context_0: MSG_ELIGIBILITY_INFO_10,
      context_1: MSG_ELIGIBILITY_INFO_13,
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: 'eligibility_info'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: 'eligibility_info',
      current_fpm_method: this.state.currentFPMMethod
    });
  }


  /**
   * demographic_question messages handler
   * Generated from flowchart - 1 messages
   */
  private async handleDemographicQuestionMessages(context: string): Promise<void> {
    // Message selection based on context
    const messageMap: Record<string, any> = {
      context_0: MSG_DEMOGRAPHIC_QUESTION_14,
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: 'demographic_question'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: 'demographic_question',
      current_fpm_method: this.state.currentFPMMethod
    });
  }


  /**
   * stop_switch_question messages handler
   * Generated from flowchart - 1 messages
   */
  private async handleStopSwitchQuestionMessages(context: string): Promise<void> {
    // Message selection based on context
    const messageMap: Record<string, any> = {
      context_0: MSG_STOP_SWITCH_QUESTION_18,
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: 'stop_switch_question'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: 'stop_switch_question',
      current_fpm_method: this.state.currentFPMMethod
    });
  }


  /**
   * side_effect_question messages handler
   * Generated from flowchart - 1 messages
   */
  private async handleSideEffectQuestionMessages(context: string): Promise<void> {
    // Message selection based on context
    const messageMap: Record<string, any> = {
      context_0: MSG_SIDE_EFFECT_QUESTION_21,
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: 'side_effect_question'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: 'side_effect_question',
      current_fpm_method: this.state.currentFPMMethod
    });
  }


  /**
   * fertility_info messages handler
   * Generated from flowchart - 10 messages
   */
  private async handleFertilityInfoMessages(context: string): Promise<void> {
    // Message selection based on context
    const messageMap: Record<string, any> = {
      context_0: MSG_FERTILITY_INFO_22,
      context_1: MSG_FERTILITY_INFO_24,
      context_2: MSG_FERTILITY_INFO_33,
      context_3: MSG_FERTILITY_INFO_35,
      context_4: MSG_FERTILITY_INFO_38,
      context_5: MSG_FERTILITY_INFO_40,
      context_6: MSG_FERTILITY_INFO_42,
      context_7: MSG_FERTILITY_INFO_44,
      context_8: MSG_FERTILITY_INFO_45,
      context_9: MSG_FERTILITY_INFO_46,
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: 'fertility_info'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: 'fertility_info',
      current_fpm_method: this.state.currentFPMMethod
    });
  }

