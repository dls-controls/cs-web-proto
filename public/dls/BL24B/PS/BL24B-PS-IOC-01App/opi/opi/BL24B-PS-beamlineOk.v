$table.parse("BL24B-PS-beamlineOk.csv")
#set($dom = "BL24B")
#set($nSerial = 3)
#set($nParIlk = 4)
#set($nParLop = -1)
#set($splitRowId = 4)
#set($title = "PSS - BL24B: BEAMLINE OK")
#parse("pss_include.v")
