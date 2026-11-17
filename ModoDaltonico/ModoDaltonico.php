<?php

class ModoDaltonicoPlugin extends MantisPlugin {

	public function register() {
		$this->name        = plugin_lang_get( 'nombre' );
		$this->description = plugin_lang_get( 'descripcion' );
		$this->version     = '1.0.0';
		$this->requires    = array( 'MantisCore' => '2.0.0' );
		$this->author      = 'Equipo Accesibilidad';
		$this->contact     = 'accesibilidad@example.com';
		$this->url         = 'https://example.com/modo-daltonico';
		$this->page        = 'config';
	}

	public function config() {
		return array(
			'enabled'       => ON,
			'contrast_type' => 'protanopia',
		);
	}

	public function events() {
		return array();
	}

	public function hooks() {
		return array(
			'EVENT_MENU_MAIN'       => 'menu_main',
			'EVENT_LAYOUT_RESOURCES' => 'layout_resources',
		);
	}

	public function menu_main( $p_event ) {
		$t_page = plugin_page( 'config' );
		$t_label = plugin_lang_get( 'configuracion' );
		return array( '<a href="' . string_attribute( $t_page ) . '">' . string_display( $t_label ) . '</a>' );
	}

	public function layout_resources( $p_event ) {
		$t_enabled = plugin_config_get( 'enabled' );
		if( OFF == $t_enabled ) {
			return;
		}

		$t_contrast_type = plugin_config_get( 'contrast_type' );

		echo '<link rel="stylesheet" href="' . string_attribute( plugin_file( 'modoDaltonico.css' ) ) . '" />' . "\n";

		$t_config = array(
			'initialActive'  => true,
			'contrastType'   => $t_contrast_type,
			'toggleUrl'      => plugin_page( 'toggle' ),
			'activeLabel'    => plugin_lang_get( 'modo_activo' ),
			'inactiveLabel'  => plugin_lang_get( 'modo_inactivo' ),
			'strings'        => array(
				'protanopia'       => plugin_lang_get( 'protanopia' ),
				'deuteranopia'     => plugin_lang_get( 'deuteranopia' ),
				'tritanopia'       => plugin_lang_get( 'tritanopia' ),
				'indicador_activo' => plugin_lang_get( 'indicador_activo' ),
				'activar'          => plugin_lang_get( 'activar' ),
				'desactivar'       => plugin_lang_get( 'desactivar' ),
			),
		);

		echo '<div id="md-config-data" data-config="'
			. string_attribute( json_encode( $t_config ) )
			. '" style="display:none;"></div>' . "\n";

		echo '<script src="' . string_attribute( plugin_file( 'modoDaltonico.js' ) ) . '"></script>' . "\n";
	}

	public function install() {
		return true;
	}

	public function uninstall() {
		return;
	}
}
