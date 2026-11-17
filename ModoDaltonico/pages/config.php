<?php

require_api( 'authentication_api.php' );
require_api( 'form_api.php' );
require_api( 'helper_api.php' );
require_api( 'print_api.php' );

auth_reauthenticate();
access_ensure_global_level( config_get( 'manage_plugin_threshold' ) );

$t_action = gpc_get_string( 'action', '' );

if( 'save' === $t_action ) {
	form_security_validate( 'plugin_ModoDaltonico_config' );

	$t_enabled = gpc_get_int( 'enabled', ON );
	$t_contrast_type = gpc_get_string( 'contrast_type', 'protanopia' );

	$t_valid_types = array( 'protanopia', 'deuteranopia', 'tritanopia' );
	if( !in_array( $t_contrast_type, $t_valid_types, true ) ) {
		$t_contrast_type = 'protanopia';
	}

	if( ON !== $t_enabled && OFF !== $t_enabled ) {
		$t_enabled = ON;
	}

	plugin_config_set( 'enabled', $t_enabled );
	plugin_config_set( 'contrast_type', $t_contrast_type );

	form_security_purge( 'plugin_ModoDaltonico_config' );

	print_header_redirect( plugin_page( 'config', true ) );
}

$t_enabled = plugin_config_get( 'enabled' );
$t_contrast_type = plugin_config_get( 'contrast_type' );

layout_page_header( plugin_lang_get( 'config_titulo' ) );
layout_page_begin();

?>

<div class="col-md-12 col-xs-12">
	<div class="space-10"></div>
	<div class="widget-box widget-color-blue2">
		<div class="widget-header widget-header-small">
			<h4 class="widget-title lighter">
				<?php print_icon( 'fa-universal-access', 'ace-icon' ); ?>
				<?php echo string_display( plugin_lang_get( 'config_titulo' ) ); ?>
			</h4>
		</div>
		<div class="widget-body">
			<div class="widget-main no-padding">
				<div class="table-responsive">
					<form id="md-config-form"
						  action="<?php echo string_attribute( plugin_page( 'config' ) ); ?>"
						  method="post">

						<?php echo form_security_field( 'plugin_ModoDaltonico_config' ); ?>
						<input type="hidden" name="action" value="save" />

						<table class="table table-bordered table-condensed table-striped">
							<tr>
								<td class="category" style="width:30%;">
									<?php echo string_display( plugin_lang_get( 'activacion_defecto' ) ); ?>
								</td>
								<td>
									<label>
										<input type="radio" name="enabled" value="1"
											<?php echo ( ON == $t_enabled ) ? 'checked="checked"' : ''; ?> />
										<?php echo string_display( plugin_lang_get( 'activado' ) ); ?>
									</label>
									&nbsp;&nbsp;
									<label>
										<input type="radio" name="enabled" value="0"
											<?php echo ( OFF == $t_enabled ) ? 'checked="checked"' : ''; ?> />
										<?php echo string_display( plugin_lang_get( 'desactivado' ) ); ?>
									</label>
								</td>
							</tr>
							<tr>
								<td class="category">
									<?php echo string_display( plugin_lang_get( 'tipo_contraste' ) ); ?>
								</td>
								<td>
									<select id="md-contrast-type" name="contrast_type" class="input-sm">
										<option value="protanopia"
											<?php echo ( 'protanopia' === $t_contrast_type ) ? 'selected="selected"' : ''; ?>>
											<?php echo string_display( plugin_lang_get( 'protanopia' ) ); ?>
										</option>
										<option value="deuteranopia"
											<?php echo ( 'deuteranopia' === $t_contrast_type ) ? 'selected="selected"' : ''; ?>>
											<?php echo string_display( plugin_lang_get( 'deuteranopia' ) ); ?>
										</option>
										<option value="tritanopia"
											<?php echo ( 'tritanopia' === $t_contrast_type ) ? 'selected="selected"' : ''; ?>>
											<?php echo string_display( plugin_lang_get( 'tritanopia' ) ); ?>
										</option>
									</select>
								</td>
							</tr>
						</table>

						<div class="widget-toolbox padding-8 clearfix">
							<input type="submit" class="btn btn-primary btn-white btn-round"
								   value="<?php echo string_attribute( plugin_lang_get( 'guardar' ) ); ?>" />
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>

<?php

layout_page_end();
