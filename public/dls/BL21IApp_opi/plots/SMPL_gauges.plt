<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<databrowser>
    <title></title>
    <save_changes>false</save_changes>
    <show_legend>false</show_legend>
    <show_toolbar>true</show_toolbar>
    <grid>false</grid>
    <scroll>true</scroll>
    <update_period>3.0</update_period>
    <scroll_step>5</scroll_step>
    <start>-5 minutes 0.0 seconds</start>
    <end>now</end>
    <archive_rescale>NONE</archive_rescale>
    <background>
        <red>255</red>
        <green>255</green>
        <blue>255</blue>
    </background>
    <title_font>Sans|15|1</title_font>
    <label_font>Sans|10|1</label_font>
    <scale_font>Sans|9|0</scale_font>
    <legend_font>Sans|9|0</legend_font>
    <axes>
        <axis>
            <visible>true</visible>
            <name>Pressure</name>
            <use_axis_name>false</use_axis_name>
            <use_trace_names>true</use_trace_names>
            <right>false</right>
            <color>
                <red>0</red>
                <green>0</green>
                <blue>0</blue>
            </color>
            <label_font>|10|0</label_font>
            <scale_font>|10|0</scale_font>
            <min>3.0E-10</min>
            <max>1.78E-8</max>
            <grid>false</grid>
            <autoscale>true</autoscale>
            <log_scale>false</log_scale>
        </axis>
    </axes>
    <annotations>
    </annotations>
    <pvlist>
        <pv>
            <display_name>Mirror 4 and Diagnostic 8</display_name>
            <visible>true</visible>
            <name>BL21I-VA-GAUGE-20:P</name>
            <axis>0</axis>
            <color>
                <red>255</red>
                <green>0</green>
                <blue>0</blue>
            </color>
            <trace_type>AREA</trace_type>
            <linewidth>2</linewidth>
            <point_type>NONE</point_type>
            <point_size>2</point_size>
            <waveform_index>0</waveform_index>
            <period>0.0</period>
            <ring_size>5000</ring_size>
            <request>OPTIMIZED</request>
            <archive>
                <name>Primary Archiver Appliance</name>
                <url>pbraw://archappl.diamond.ac.uk/retrieval</url>
                <key>1</key>
            </archive>
            <archive>
                <name>Standby Archiver Appliance</name>
                <url>pbraw://sbarchappl.diamond.ac.uk/retrieval</url>
                <key>2</key>
            </archive>
        </pv>
        <pv>
            <display_name>Sample Chamber</display_name>
            <visible>true</visible>
            <name>BL21I-VA-GAUGE-21:P</name>
            <axis>0</axis>
            <color>
                <red>255</red>
                <green>165</green>
                <blue>0</blue>
            </color>
            <trace_type>AREA</trace_type>
            <linewidth>2</linewidth>
            <point_type>NONE</point_type>
            <point_size>2</point_size>
            <waveform_index>0</waveform_index>
            <period>0.0</period>
            <ring_size>5000</ring_size>
            <request>OPTIMIZED</request>
            <archive>
                <name>Primary Archiver Appliance</name>
                <url>pbraw://archappl.diamond.ac.uk/retrieval</url>
                <key>1</key>
            </archive>
            <archive>
                <name>Standby Archiver Appliance</name>
                <url>pbraw://sbarchappl.diamond.ac.uk/retrieval</url>
                <key>2</key>
            </archive>
        </pv>
        <pv>
            <display_name>Load Lock</display_name>
            <visible>true</visible>
            <name>BL21I-VA-GAUGE-27:P</name>
            <axis>0</axis>
            <color>
                <red>0</red>
                <green>255</green>
                <blue>0</blue>
            </color>
            <trace_type>AREA</trace_type>
            <linewidth>2</linewidth>
            <point_type>NONE</point_type>
            <point_size>2</point_size>
            <waveform_index>0</waveform_index>
            <period>0.0</period>
            <ring_size>5000</ring_size>
            <request>OPTIMIZED</request>
            <archive>
                <name>Primary Archiver Appliance</name>
                <url>pbraw://archappl.diamond.ac.uk/retrieval</url>
                <key>1</key>
            </archive>
            <archive>
                <name>Standby Archiver Appliance</name>
                <url>pbraw://sbarchappl.diamond.ac.uk/retrieval</url>
                <key>2</key>
            </archive>
        </pv>
        <pv>
            <display_name>Load Lock Turbo</display_name>
            <visible>true</visible>
            <name>BL21I-VA-GAUGE-28:P</name>
            <axis>0</axis>
            <color>
                <red>144</red>
                <green>238</green>
                <blue>144</blue>
            </color>
            <trace_type>AREA</trace_type>
            <linewidth>2</linewidth>
            <point_type>NONE</point_type>
            <point_size>2</point_size>
            <waveform_index>0</waveform_index>
            <period>0.0</period>
            <ring_size>5000</ring_size>
            <request>OPTIMIZED</request>
            <archive>
                <name>Primary Archiver Appliance</name>
                <url>pbraw://archappl.diamond.ac.uk/retrieval</url>
                <key>1</key>
            </archive>
            <archive>
                <name>Standby Archiver Appliance</name>
                <url>pbraw://sbarchappl.diamond.ac.uk/retrieval</url>
                <key>2</key>
            </archive>
        </pv>
    </pvlist>
</databrowser>
